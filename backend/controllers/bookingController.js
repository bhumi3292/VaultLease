const Booking = require('../models/Booking');
const Space = require('../models/Space'); // Updated to use Space model (spaces collection)
const User = require('../models/User');

// SECURITY NOTE: This controller is protected by 'sensitiveLimiter' rate limiting middleware.
// See middlewares/apiLimiter.js for configuration.
const createBooking = async (req, res) => {
    try {
        const { property: propertyId } = req.body;
        const tenantId = req.user.id;

        console.log(`[CreateBooking] Request received for AssetID: ${propertyId}, TenantID: ${tenantId}`);

        // 1. Fetch the Asset (Space)
        // Using Space model because data is in 'spaces' collection
        const property = await Space.findById(propertyId);

        if (!property) {
            console.log(`[CreateBooking] Asset (Space) not found for ID: ${propertyId}`);
            return res.status(404).json({
                success: false,
                message: `Asset with ID ${propertyId} not found in database`
            });
        }

        // 2. Check Availability (Quantity/Capacity must be > 1)
        // Using 'capacity' field for Quantity as per Space schema
        const quantity = property.capacity || 0;

        if (quantity <= 1) {
            return res.status(400).json({
                success: false,
                message: "Asset is not available for booking (Minimum quantity reached)"
            });
        }

        // 3. Create the Booking
        const date = req.body.date || new Date().toISOString().split('T')[0];
        const timeSlot = req.body.timeSlot || new Date().toLocaleTimeString();

        const booking = await Booking.create({
            property: propertyId,
            tenant: tenantId,
            landlord: property.manager, // Using 'manager' field from Space schema
            date: date,
            timeSlot: timeSlot,
            status: 'confirmed'
        });

        // 4. Update Asset Quantity
        property.capacity = quantity - 1;
        await property.save();

        res.status(201).json({
            success: true,
            data: booking,
            message: "Booking created successfully"
        });

    } catch (err) {
        console.error("Create Booking Error:", err);
        // Handle duplicate key error (if unique index is violated)
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Booking already exists for this slot"
            });
        }
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: err.message
        });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        // Allow both Tenant and Landlord (Department Admin) to see their bookings
        const bookings = await Booking.find({
            $or: [{ tenant: req.user.id }, { landlord: req.user.id }]
        })
            .populate('property')
            .populate('landlord', 'fullName email phoneNumber');

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (err) {
        console.error("Get My Bookings Error:", err);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: err.message
        });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('property')
            .populate('tenant', 'fullName email')
            .populate('landlord', 'fullName email');

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (err) {
        console.error("Get All Bookings Error:", err);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: err.message
        });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        const oldStatus = booking.status;

        // Update status
        booking.status = status;
        if (status === 'returned') {
            booking.returnedAt = Date.now();
        }

        await booking.save();

        // Increment inventory if we are releasing the asset
        // Releasing happens when going from (pending/confirmed) -> (returned/cancelled/rejected)
        const isReleasing = ['pending', 'confirmed'].includes(oldStatus) && ['returned', 'cancelled', 'rejected'].includes(status);

        if (isReleasing) {
            const property = await Space.findById(booking.property);
            if (property) {
                property.capacity = (property.capacity || 0) + 1;
                await property.save();
            }
        }

        res.status(200).json({
            success: true,
            data: booking,
            message: `Booking updated to ${status}`
        });

    } catch (err) {
        console.error("Update Booking Error:", err);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: err.message
        });
    }
};