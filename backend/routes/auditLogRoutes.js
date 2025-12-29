const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const { authenticateUser } = require('../middlewares/auth');
const roleCheck = require('../middlewares/role');

// Only Admin can view audit logs
router.get(
    '/',
    authenticateUser,
    roleCheck('ADMIN'),
    auditLogController.getAuditLogs
);

module.exports = router;
