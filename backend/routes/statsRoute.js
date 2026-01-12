const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticateUser, requireRole } = require('../middlewares/auth');

// Get Dashboard Stats (Admin only)
router.get('/dashboard', authenticateUser, requireRole('Administrator'), statsController.getDashboardStats);

module.exports = router;
