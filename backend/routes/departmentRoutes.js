const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { authenticateUser } = require('../middlewares/auth');
const roleCheck = require('../middlewares/role');

// Public (e.g. for selection dropdowns)
router.get('/', departmentController.getAllDepartments);

// Admin Only routes
router.post(
    '/',
    authenticateUser,
    roleCheck('ADMIN'),
    departmentController.createDepartment
);

router.get(
    '/:id',
    authenticateUser,
    roleCheck('ADMIN', 'ADMINISTRATOR'), // Admin and staff can view details
    departmentController.getDepartmentById
);

router.put(
    '/:id',
    authenticateUser,
    roleCheck('ADMIN'),
    departmentController.updateDepartment
);

router.delete(
    '/:id',
    authenticateUser,
    roleCheck('ADMIN'),
    departmentController.deleteDepartment
);

router.put(
    '/:id/assign-user',
    authenticateUser,
    roleCheck('ADMIN'),
    departmentController.assignUserToDepartment
);

module.exports = router;
