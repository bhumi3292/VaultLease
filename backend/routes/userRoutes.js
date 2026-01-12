const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateUser, requireRole } = require('../middlewares/auth');

// Audit Logs (Admin only)
router.get('/logs', authenticateUser, requireRole('Administrator'), userController.getAuditLogs);

// Get all users (Admin only)
router.get('/', authenticateUser, requireRole('Administrator'), userController.getAllUsers);

// Create new user (Admin only)
router.post('/', authenticateUser, requireRole('Administrator'), userController.createUser);

// Get single user by ID (Admin only)
router.get('/:id', authenticateUser, requireRole('Administrator'), userController.getUserById);

// Update user details (Admin only)
router.put('/:id', authenticateUser, requireRole('Administrator'), userController.updateUserById);

// Delete user by ID (Admin only)
router.delete('/:id', authenticateUser, requireRole('Administrator'), userController.deleteUserById);

// Update user status/role (Admin only)
router.put('/status/:id', authenticateUser, requireRole('Administrator'), userController.updateUserStatus);

// Self-User routes (Already in authRoutes mainly, but profile management is here)
router.put('/profile', authenticateUser, userController.updateUserProfile);
router.put('/change-password', authenticateUser, userController.changePassword);
router.delete('/delete-account', authenticateUser, userController.deleteUser);

module.exports = router;
