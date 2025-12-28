const express = require('express');
const router = express.Router();
const accessRequestController = require('../controllers/accessRequestController');
const { authenticateUser } = require('../middlewares/auth');
const roleCheck = require('../middlewares/role');

// Requester Actions
router.post(
    '/request',
    authenticateUser,
    roleCheck('STUDENT'),
    accessRequestController.createRequest
);

router.get(
    '/my-requests',
    authenticateUser,
    roleCheck('STUDENT'),
    accessRequestController.getMyRequests
);

// Administrator Actions
router.get(
    '/department-requests',
    authenticateUser,
    roleCheck('ADMINISTRATOR', 'ADMIN'),
    accessRequestController.getDepartmentRequests
);

router.put(
    '/:id/status',
    authenticateUser,
    roleCheck('ADMINISTRATOR', 'ADMIN'),
    accessRequestController.updateRequestStatus
);

module.exports = router;
