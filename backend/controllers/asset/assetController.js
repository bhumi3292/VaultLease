const Asset = require('../../models/Asset');
const ApiResponse = require('../../utils/api_response');

const createAsset = async (req, res) => {
    try {
        // req.user is set by auth middleware
        // Automatically assign the asset to the Administrator's department
        let imagePaths = [];
        if (req.files && req.files.images) {
            imagePaths = req.files.images.map(file => `uploads/${file.filename}`);
        }

        const assetData = {
            ...req.body,
            images: imagePaths,
            administrator: req.user._id,
            department: req.user.department
        };

        const newAsset = new Asset(assetData);
        await newAsset.save();

        // Audit Log
        const logAction = require('../../utils/auditLogger');
        await logAction({
            userId: req.user._id,
            action: 'CREATE',
            entity: 'Asset',
            entityId: newAsset._id,
            details: {
                name: newAsset.name,
                category: newAsset.category,
                department: newAsset.department
            }
        }, req);

        return res.status(201).json(new ApiResponse(201, newAsset, "Asset created successfully"));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, null, error.message));
    }
};

const getAllAssets = async (req, res) => {
    try {
        const { search, category, status, department } = req.query;
        let query = {};

        if (search) {
            query.$text = { $search: search };
        }
        if (category) {
            query.category = category;
        }
        if (status) {
            query.status = status;
        }
        if (department) {
            query.department = department; // Filter by department
        }

        // populate category name (field is category_name in Category model)
        const assets = await Asset.find(query)
            .populate('category', 'category_name')
            .populate('administrator', 'fullName email');

        return res.status(200).json(new ApiResponse(200, assets, "Assets retrieved successfully"));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, null, error.message));
    }
};

const getAssetById = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id)
            .populate('category', 'category_name')
            .populate('administrator', 'fullName email department');

        if (!asset) {
            return res.status(404).json(new ApiResponse(404, null, "Asset not found"));
        }
        return res.status(200).json(new ApiResponse(200, asset, "Asset details"));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, null, error.message));
    }
};

const updateAsset = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);
        if (!asset) return res.status(404).json(new ApiResponse(404, null, "Asset not found"));

        if (req.user.role !== 'ADMIN' && asset.administrator.toString() !== req.user._id.toString()) {
            return res.status(403).json(new ApiResponse(403, null, "Not authorized to update this asset"));
        }

        const updatedAsset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true });
        return res.status(200).json(new ApiResponse(200, updatedAsset, "Asset updated successfully"));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, null, error.message));
    }
};

const deleteAsset = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);
        if (!asset) return res.status(404).json(new ApiResponse(404, null, "Asset not found"));

        if (req.user.role !== 'ADMIN' && asset.administrator.toString() !== req.user._id.toString()) {
            return res.status(403).json(new ApiResponse(403, null, "Not authorized to delete this asset"));
        }

        await Asset.findByIdAndDelete(req.params.id);
        return res.status(200).json(new ApiResponse(200, null, "Asset deleted successfully"));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, null, error.message));
    }
};

module.exports = {
    createAsset,
    getAllAssets,
    getAssetById,
    updateAsset,
    deleteAsset
};