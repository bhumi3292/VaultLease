// backend/controllers/cartController.js
const Cart = require('../models/Cart'); // Assuming the model is named Cart.js
const Property = require('../models/Property');
const { asyncHandler } = require('../utils/asyncHandler'); // Assuming you have this utility

exports.getCart = asyncHandler(async (req, res) => {
    const userId = req.user._id; // User ID from authenticated request

    const cart = await Cart.findOne({ user: userId }).populate('items.property');

    if (!cart) {
        // If a user doesn't have a cart yet, return an empty cart
        return res.status(200).json({ success: true, message: "Cart is empty or not yet created.", data: { user: userId, items: [] } });
    }

    res.status(200).json({ success: true, message: "Cart retrieved successfully.", data: cart });
});

exports.addToCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { propertyId } = req.body;

    if (!propertyId) {
        return res.status(400).json({ success: false, message: "Property ID is required to add to cart." });
    }

    // Validate if the property exists
    const propertyExists = await Property.findById(propertyId);
    if (!propertyExists) {
        return res.status(404).json({ success: false, message: "Property not found." });
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