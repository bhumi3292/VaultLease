const Category = require("../../models/Category");

exports.createCategory = async (req, res) => {
    try {
        const { name, types } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }

        const exists = await Category.findOne({ category_name: name });
        if (exists) {
            return res.status(400).json({ success: false, message: "Category already exists" });
        }

        const category = await Category.create({
            category_name: name,
            types: Array.isArray(types) ? types : []
        });

        res.status(201).json({ success: true, message: "Category created", data: category });
    } catch (err) {
        console.error("Create category error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: categories });
    } catch (err) {
        console.error("Get categories error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        res.status(200).json({ success: true, data: category });
    } catch (err) {
        console.error("Get category by ID error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { name, types } = req.body;

        const updateData = {};
        if (name) updateData.category_name = name;
        if (Array.isArray(types)) updateData.types = types;

        const updated = await Category.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({ success: true, message: "Category updated", data: updated });
    } catch (err) {
        console.error("Update category error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const deleted = await Category.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({ success: true, message: "Category deleted" });
    } catch (err) {
        console.error("Delete category error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
