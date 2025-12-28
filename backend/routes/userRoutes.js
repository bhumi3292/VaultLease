const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateUser } = require('../middlewares/auth');
const roleCheck = require('../middlewares/role');

// Admin only routes
router.get('/', authenticateUser, roleCheck('ADMIN'), userController.getAllUsers);
router.put('/:id', authenticateUser, roleCheck('ADMIN'), userController.updateUserRole);

module.exports = router;
