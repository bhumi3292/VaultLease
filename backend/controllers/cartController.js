// vaultlease_backend/controllers/cartController.js
const Cart = require('../models/cart'); // Corrected import case just in case
const Space = require('../models/Space');
const { asyncHandler } = require('../utils/asyncHandler');

exports.getCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Populate using 'Space' model ref from schema
    const cart = await Cart.findOne({ user: userId }).populate('items.property');

    if (!cart) {
        return res.status(200).json({ success: true, message: "Cart is empty or not yet created.", data: { user: userId, items: [] } });
    }

    res.status(200).json({ success: true, message: "Cart retrieved successfully.", data: cart });
});

exports.addToCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { propertyId } = req.body;

    if (!propertyId) {
        return res.status(400).json({ success: false, message: "Property/Space ID is required." });
    }

    // Validate if the space exists
    const spaceExists = await Space.findById(propertyId);
    if (!spaceExists) {
        return res.status(404).json({ success: false, message: "Space/Property not found." });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        // If no cart exists for the user, create a new one
        cart = await Cart.create({
            user: userId,
            items: [{ property: propertyId }]
        });
        return res.status(201).json({ success: true, message: "Cart created and property added.", data: cart });
    }

    // Check if the property is already in the cart
    const itemExists = cart.items.some(item => item.property.toString() === propertyId);

    if (itemExists) {
        return res.status(409).json({ success: false, message: "Property already in cart." });
    } else {
        // Add the new property to the existing cart
        cart.items.push({ property: propertyId });
        await cart.save();
        return res.status(200).json({ success: true, message: "Property added to cart.", data: cart });
    }
});
exports.removeFromCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { propertyId } = req.params; // Get propertyId from URL params

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        return res.status(404).json({ success: false, message: "Cart not found." });
    }

    // Filter out the item to be removed
    const initialItemCount = cart.items.length;
    cart.items = cart.items.filter(item => item.property.toString() !== propertyId);

    if (cart.items.length === initialItemCount) {
        // If no item was removed, it means the propertyId was not in the cart
        return res.status(404).json({ success: false, message: "Property not found in cart." });
    }

    await cart.save();
    res.status(200).json({ success: true, message: "Property removed from cart.", data: cart });
});
exports.clearCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const result = await Cart.deleteOne({ user: userId });

    if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: "Cart not found to clear." });
    }


    res.status(200).json({ success: true, message: "Cart cleared successfully." });
});