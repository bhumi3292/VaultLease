const Department = require("../../models/Department");

exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Department Name is required" });
        }

        const exists = await Department.findOne({ department_name: name });
        if (exists) {
            return res.status(400).json({ success: false, message: "Department already exists" });
        }

        const category = await Department.create({
            department_name: name
        });

        res.status(201).json({ success: true, message: "Department created", data: category });
    } catch (err) {
        console.error("Create department error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const departments = await Department.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: departments });
    } catch (err) {
        console.error("Get departments error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const category = await Department.findById(req.params.id);
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
        const { name } = req.body;

        const updateData = {};
        if (name) updateData.department_name = name; // Map 'name' to 'department_name'

        const updated = await Department.findByIdAndUpdate(
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
        const deleted = await Department.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({ success: true, message: "Category deleted" });
    } catch (err) {
        console.error("Delete category error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
