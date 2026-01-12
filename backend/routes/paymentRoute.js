const express = require('express');
const router = express.Router();
const {
    initiatePayment,
    verifyKhaltiPayment,
    verifyEsewaPayment,
    getAllPayments,
    updatePaymentStatus
} = require('../controllers/payment/paymentController');
const { authenticateUser, requireRole } = require('../middlewares/auth');

router.post('/initiate', authenticateUser, initiatePayment);
router.post('/verify/khalti', verifyKhaltiPayment);
router.post('/verify/esewa', verifyEsewaPayment);

// Admin Routes
router.get('/all', authenticateUser, requireRole('Administrator'), getAllPayments);
router.put('/status/:id', authenticateUser, requireRole('Administrator'), updatePaymentStatus);

module.exports = router;