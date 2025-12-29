const Department = require('../models/Department');
const User = require('../models/User');
const ApiResponse = require('../utils/api_response');
const ApiError = require('../utils/api_error');
const { asyncHandler } = require('../utils/asyncHandler');

// @desc    Create a new department
// @route   POST /api/departments
// @access  Admin
exports.createDepartment = asyncHandler(async (req, res, next) => {
    const { name, description, headOfDepartment } = req.body;

    const existingDept = await Department.findOne({ name });
    if (existingDept) {
        return next(new ApiError(400, "Department already exists"));
    }

    const department = await Department.create({
        name,
        description,
        headOfDepartment
    });

    res.status(201).json(new ApiResponse(201, department, "Department created successfully"));
});

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public (or Admin only depending on requirement, currently making it accessible for dropdowns)
exports.getAllDepartments = asyncHandler(async (req, res, next) => {
    const departments = await Department.find().populate('headOfDepartment', 'fullName email');
    res.status(200).json(new ApiResponse(200, departments, "Departments fetched successfully"));
});

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Admin/Administrator
exports.getDepartmentById = asyncHandler(async (req, res, next) => {
    const department = await Department.findById(req.params.id)
        .populate('headOfDepartment', 'fullName email');

    if (!department) {
        return next(new ApiError(404, "Department not found"));
    }

    res.status(200).json(new ApiResponse(200, department, "Department fetched successfully"));
});

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Admin
exports.updateDepartment = asyncHandler(async (req, res, next) => {
    const { name, description, headOfDepartment } = req.body;

    let department = await Department.findById(req.params.id);
    if (!department) {
        return next(new ApiError(404, "Department not found"));
    }

    department.name = name || department.name;
    department.description = description || department.description;
    if (headOfDepartment) department.headOfDepartment = headOfDepartment;

    const updatedDepartment = await department.save();

    res.status(200).json(new ApiResponse(200, updatedDepartment, "Department updated successfully"));
});

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Admin
exports.deleteDepartment = asyncHandler(async (req, res, next) => {
    const department = await Department.findById(req.params.id);

    if (!department) {
        return next(new ApiError(404, "Department not found"));
    }

    await department.deleteOne();

    res.status(200).json(new ApiResponse(200, null, "Department deleted successfully"));
});

// @desc    Assign user to department (Admin function but logically sits well with user management or here)
// @route   PUT /api/departments/:id/assign-user
// @access  Admin
exports.assignUserToDepartment = asyncHandler(async (req, res, next) => {
    const { userId } = req.body;
    const departmentId = req.params.id;

    const department = await Department.findById(departmentId);
    if (!department) {
        return next(new ApiError(404, "Department not found"));
    }

    const user = await User.findById(userId);
    if (!user) {
        return next(new ApiError(404, "User not found"));
    }

    // Update User's department field (currently a String in User model, can use ID or Name)
    // Strategy: We will store the Department Name for now to stay consistent with existing string-based logic,
    // BUT we should transition to IDs eventually. For now, name is safer for the requested refactor speed.
    user.department = department.name;
    await user.save();

    res.status(200).json(new ApiResponse(200, user, "User assigned to department successfully"));
});
