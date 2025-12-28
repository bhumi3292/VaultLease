const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateUser } = require('../middlewares/authorizedUser'); // Corrected path


router.use(authenticateUser); // Apply authentication to all cart routes
router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.delete('/remove/:propertyId', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);

module.exports = router; // FIX: Corrected 'Exports' to 'exports'