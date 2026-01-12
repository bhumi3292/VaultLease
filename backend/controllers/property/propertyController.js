const fs = require('fs').promises;
const path = require('path');
const Space = require("../../models/Space");
const Department = require("../../models/Department");
const User = require('../../models/User'); // manager/department admin

// Helper to extract file paths from Multer's `req.files`
const extractFilePaths = (files) => {
    if (!files) return [];
    // Multer's file.path is relative to the project root where 'uploads' is.
    return files.map(file => file.path);
};

// Helper to delete files from the filesystem
const deleteFiles = async (filePaths) => {
    const deletionPromises = filePaths.map(async (filePath) => {

        const fullPath = path.join(process.cwd(), filePath);
        try {
            await fs.access(fullPath); // Check if file exists
            await fs.unlink(fullPath); // Delete the file
            console.log(`Successfully deleted file: ${fullPath}`);
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.warn(`File not found, skipping deletion: ${fullPath}`);
            } else {
                console.error(`Error deleting file ${fullPath}:`, err);
            }
        }
    });
    await Promise.all(deletionPromises);
};

// --- CREATE SPACE (Department Room) ---
exports.createProperty = async (req, res) => {
    // Collect paths of newly uploaded files so they can be cleaned up on error
    const uploadedFilePaths = [];
    try {
        // Frontend sends: title, description, location, categoryId, bedrooms (Quantity), bathrooms (Floor), price (Lease Cost)
        // Space Model expects: roomName, roomDescription, location, departmentId, capacity, manager, images
        // We will map:
        // title -> roomName
        // description -> roomDescription
        // categoryId -> departmentId
        // bedrooms -> capacity (Quantity)
        // Note: 'price' and 'bathrooms' (floor) are not in the current Space schema shown previously.
        // If we need to save them, we should add them to schema or just ignore for now if schema isn't changing.
        // PLEASE NOTE: The user asked to "complete CRUD". If the schema doesn't have price/floor, data is lost.
        // For now, I will start with what the schema supports to prevent crashes.

        const { title, description, location, categoryId, bedrooms, price, bathrooms } = req.body;

        // Add newly uploaded file paths to the cleanup array
        if (req.files?.images) uploadedFilePaths.push(...extractFilePaths(req.files.images));

        // Basic validation
        if (!title || !categoryId) {
            throw new Error("Missing required fields: Resource Name or Department.");
        }

        // Check if department exists
        const department = await Department.findById(categoryId);
        if (!department) {
            throw new Error("Invalid department ID provided.");
        }

        // Create a new space (department room/asset) document
        const space = new Space({
            roomName: title,
            roomDescription: description,
            location,
            capacity: bedrooms ? parseInt(bedrooms) : 0, // Mapping Quantity/Units to capacity
            price: price ? parseFloat(price) : 0,
            floorLevel: bathrooms ? parseInt(bathrooms) : 0, // Mapping Floor Level to floorLevel
            departmentId: categoryId,
            images: extractFilePaths(req.files?.images),
            // videos: [], // Removed as per requirement
            manager: req.user?._id,
        });

        await space.save();

        res.status(201).json({ success: true, message: "Asset added successfully", data: space });
    } catch (err) {
        console.error("Create asset error:", err.message);
        // Clean up uploaded files if something goes wrong before saving to DB
        if (uploadedFilePaths.length > 0) {
            await deleteFiles(uploadedFilePaths);
        }
        // Use a more specific error message if it's a validation type error
        const statusCode = err.message.includes("required fields") || err.message.includes("Invalid department") ? 400 : 500;
        res.status(statusCode).json({ success: false, message: err.message || "Server error. Failed to create asset." });
    }
};

// --- GET ALL SPACES ---
exports.getAllProperties = async (req, res) => {
    try {
        const spaces = await Space.find({})
            .populate("departmentId", "departmentName")
            .populate("manager", "fullName email phoneNumber profilePicture");

        res.status(200).json({
            success: true,
            message: "Department rooms fetched successfully.",
            data: spaces,
        });
    } catch (err) {
        console.error("Get spaces error:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// --- GET SINGLE PROPERTY --- (No changes needed)
exports.getOneProperty = async (req, res) => {
    try {
        const space = await Space.findById(req.params.id)
            .populate("departmentId", "departmentName")
            .populate("manager", "fullName email phoneNumber profilePicture");

        if (!space) {
            return res.status(404).json({ success: false, message: "Department room not found" });
        }

        res.status(200).json({ success: true, data: space });
    } catch (err) {
        console.error("Get space error:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// --- UPDATE PROPERTY --- (Improved error handling for file cleanup and validation)
// --- UPDATE PROPERTY --- (Improved error handling for file cleanup and validation)
exports.updateProperty = async (req, res) => {
    // console.log(req.body)
    const newlyUploadedFilePaths = []; // Track files uploaded during this request for potential cleanup
    try {
        // Frontend sends: title, description, location, bedrooms (quantity), bathrooms (floor), price, categoryId
        // Mapping: bedrooms -> capacity. Ignoring price/bathrooms for now as schema doesn't support them.

        const space = await Space.findById(req.params.id);
        if (!space) {
            return res.status(404).json({ success: false, message: "Asset not found." });
        }

        // Authorization check: Must be manager (admin who created it)
        if (space.manager && space.manager.toString() !== req.user._id.toString()) {
            // If unauthorized, clean up any newly uploaded files
            if (req.files?.images) newlyUploadedFilePaths.push(...extractFilePaths(req.files.images));
            await deleteFiles(newlyUploadedFilePaths);
            return res.status(403).json({ success: false, message: "Unauthorized access: You do not manage this asset." });
        }

        const {
            title, description, location, bedrooms, categoryId,
            existingImages, price, bathrooms
        } = req.body;

        // Add newly uploaded files to cleanup array if an error occurs later
        if (req.files?.images) newlyUploadedFilePaths.push(...extractFilePaths(req.files.images));

        let existingImagesToKeep = [];
        try {
            existingImagesToKeep = existingImages ? JSON.parse(existingImages) : [];
        } catch (parseError) {
            console.error("Failed to parse existing files array:", parseError.message);
            await deleteFiles(newlyUploadedFilePaths); // Clean up new files on JSON parse error
            return res.status(400).json({ success: false, message: `Invalid JSON format for existing images: ${parseError.message}` });
        }

        // Determine which old images should be deleted
        const filesToDelete = [];
        space.images.forEach(oldPath => {
            if (!existingImagesToKeep.includes(oldPath)) filesToDelete.push(oldPath);
        });
        // We also want to delete all old videos since we are removing video support
        if (space.videos && space.videos.length > 0) {
            filesToDelete.push(...space.videos);
        }

        await deleteFiles(filesToDelete);

        const newImages = extractFilePaths(req.files?.images);
        const updatedImages = [...existingImagesToKeep, ...newImages];

        const updateData = {
            roomName: title,
            roomDescription: description,
            location,
            price: price ? parseFloat(price) : 0,
            capacity: bedrooms ? parseInt(bedrooms) : 0,
            floorLevel: bathrooms ? parseInt(bathrooms) : 0,
            images: updatedImages,
            videos: [], // Clear videos field
        };

        if (categoryId) {
            const department = await Department.findById(categoryId);
            if (!department) {
                await deleteFiles(newlyUploadedFilePaths); // Clean up new files if category ID is invalid
                return res.status(400).json({ success: false, message: "Invalid department ID." });
            }
            updateData.departmentId = categoryId; // Only set if valid category is found
        }

        const updatedSpace = await Space.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedSpace) {
            return res.status(404).json({ success: false, message: "Update failed: Asset not found or already removed." });
        }

        res.status(200).json({ success: true, message: "Asset updated successfully!", data: updatedSpace });
    } catch (err) {
        console.error("Update asset error:", err.message);
        // Clean up newly uploaded files if any other error occurs during the update process
        if (newlyUploadedFilePaths.length > 0) {
            await deleteFiles(newlyUploadedFilePaths);
        }
        res.status(500).json({ success: false, message: "Server error. Failed to update asset." });
    }
};

// --- DELETE PROPERTY --- (No changes needed)
exports.deleteProperty = async (req, res) => {
    try {
        const property = await Space.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: "Property not found." });
        }

        if (property.manager && property.manager.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized access: You do not manage this room." });
        }

        const allFilesToDelete = [...property.images, ...property.videos];

        await property.deleteOne();

        await deleteFiles(allFilesToDelete);

        res.status(200).json({ success: true, message: "Department Room deleted successfully!" });
    } catch (err) {
        console.error("Delete property error:", err.message);
        res.status(500).json({ success: false, message: "Server error. Failed to delete property." });
    }
};