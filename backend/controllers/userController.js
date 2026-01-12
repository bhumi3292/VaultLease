const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');

// Helper for audit logs
const createAuditLog = async (userId, action, req, details = '', entity = null, entityId = null) => {
    try {
        await AuditLog.create({
            user: userId,
            action,
            details,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            entity,
            entityId
        });
    } catch (e) { console.error('Audit Log Error', e); }
};

// Get all users (admin-only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        return res.status(200).json({ success: true, users });
    } catch (err) {
        console.error('Error fetching users:', err);
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

// Update user profile (Self)
exports.updateUserProfile = async (req, res) => {
    const { fullName, phoneNumber } = req.body;
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.fullName = fullName || user.fullName;
        user.phoneNumber = phoneNumber || user.phoneNumber;

        await user.save();
        await createAuditLog(userId, 'UPDATE_PROFILE', req, 'User updated their profile');

        return res.status(200).json({ success: true, message: 'Profile updated successfully', user });
    } catch (err) {
        console.error('Error updating profile:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Change password (Self)
exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user._id;

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

        user.password = newPassword;
        await user.save();
        await createAuditLog(userId, 'CHANGE_PASSWORD', req, 'User changed their password');

        return res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        console.error('Error changing password:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete user account (Self)
exports.deleteUser = async (req, res) => {
    const userId = req.user._id;

    try {
        await User.findByIdAndDelete(userId);
        await createAuditLog(userId, 'DELETE', req, 'User deleted own account');
        return res.status(200).json({ success: true, message: 'User account deleted' });
    } catch (err) {
        console.error('Error deleting user:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// --- ADMIN FUNCTIONS ---

// Create User (Admin)
exports.createUser = async (req, res) => {
    const { fullName, email, phoneNumber, role, universityId, password, department } = req.body;

    if (!fullName || !email || !phoneNumber || !role || !password || !universityId) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ success: false, message: 'User already exists' });

        user = new User({
            fullName,
            email,
            phoneNumber,
            role,
            universityId,
            password, // Hashed by pre-save
            department: role === 'Administrator' ? department : null
        });

        await user.save();
        await createAuditLog(req.user._id, 'CREATE', req, `Created user ${email}`, 'User', user._id);

        return res.status(201).json({ success: true, message: 'User created successfully', user });
    } catch (err) {
        console.error('Error creating user:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update User By ID (Admin)
exports.updateUserById = async (req, res) => {
    const { id } = req.params;
    const { fullName, email, phoneNumber, role, universityId, department } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (fullName) user.fullName = fullName;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (role) user.role = role;
        if (universityId) user.universityId = universityId;
        if (department !== undefined) user.department = department;

        await user.save();
        await createAuditLog(req.user._id, 'UPDATE', req, `Updated user ${user.email}`, 'User', user._id);

        return res.status(200).json({ success: true, message: 'User updated successfully', user });
    } catch (err) {
        console.error('Error updating user:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        await createAuditLog(req.user._id, 'DELETE', req, `Deleted user ${user.email}`, 'User', id);
        return res.status(200).json({ success: true, message: 'User deleted successfully (Admin)' });
    } catch (err) {
        console.error('Error deleting user by ID:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateUserStatus = async (req, res) => {
    const { id } = req.params;
    const { status, role } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (status) user.isActive = (status === 'Active');
        if (role) user.role = role;

        await user.save();
        await createAuditLog(req.user._id, 'UPDATE', req, `Updated status for ${user.email}`, 'User', id);
        return res.status(200).json({ success: true, message: 'User status updated', user });
    } catch (err) {
        console.error('Error updating user status:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .populate('user', 'fullName email role')
            .sort({ timestamp: -1 })
            .limit(100);
        return res.status(200).json({ success: true, logs });
    } catch (err) {
        console.error('Error fetching audit logs:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
