const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get all users (admin-only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        return res.status(200).json({ success: true, data: users });
    } catch (err) {
        console.error('Error fetching users:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Admin: Update User Role & Department
exports.updateUserRole = async (req, res) => {
    try {
        const { role, department } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const oldRole = user.role;
        const oldDepartment = user.department;

        if (role) user.role = role;
        if (department !== undefined) user.department = department; // Allow clearing if needed

        await user.save();

        // Audit Log
        const logAction = require('../utils/auditLogger');
        await logAction({
            userId: req.user._id,
            action: 'PROMOTE_USER',
            entity: 'User',
            entityId: user._id,
            details: {
                previousRole: oldRole,
                newRole: role,
                previousDepartment: oldDepartment,
                newDepartment: department
            }
        }, req);

        return res.status(200).json({ success: true, message: 'User updated', data: user });
    } catch (err) {
        console.error('Error updating user role:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get single user by ID
exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.status(200).json({ success: true, user });
    } catch (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
    const { fullName, phoneNumber } = req.body;
    const userId = req.user._id; // Assumes authentication middleware

    try {
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.fullName = fullName || user.fullName;
        user.phoneNumber = phoneNumber || user.phoneNumber;

        await user.save();

        return res.status(200).json({ success: true, message: 'Profile updated successfully', user });
    } catch (err) {
        console.error('Error updating profile:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user._id; // Assumes authentication middleware

    if (!oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Old password is incorrect' });

        user.password = newPassword; // Will be hashed by pre-save hook
        await user.save();

        return res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        console.error('Error changing password:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete user account
exports.deleteUser = async (req, res) => {
    const userId = req.user._id; // Assumes authentication middleware

    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        return res.status(200).json({ success: true, message: 'User account deleted' });
    } catch (err) {
        console.error('Error deleting user:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
