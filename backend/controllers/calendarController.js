// vaultlease_backend/controllers/calendarController.js

const Availability = require('../models/calendar'); // Your Availability model
const Booking = require('../models/Booking'); // Your Booking model
const Property = require('../models/Property'); // Your Property model
const User = require('../models/User');

const normalizeDateString = (dateInput) => {
    const d = new Date(dateInput);
    d.setUTCHours(0, 0, 0, 0); // Normalize to UTC midnight to avoid timezone issues
    return d.toISOString().split('T')[0]; // Return as 'YYYY-MM-DD' string
};


exports.createAvailability = async (req, res) => {
    const { propertyId, date, timeSlots } = req.body;
    const landlordId = req.user._id;

    if (!propertyId || !date || !Array.isArray(timeSlots) || timeSlots.length === 0) {
        return res.status(400).json({ success: false, message: 'Property ID, date, and at least one time slot are required.' });
    }

    try {
        const normalizedDate = normalizeDateString(date);

        const property = await Property.findOne({ _id: propertyId, landlord: landlordId });
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found or does not belong to you.' });
        }

        let availability = await Availability.findOne({
            landlord: landlordId,
            property: propertyId,
            date: new Date(normalizedDate) // Query using Date object as stored in DB
        });

        if (availability) {
            // When updating, ensure we don't add slots that are currently booked
            const existingBookedSlots = await Booking.find({
                property: propertyId,
                date: normalizedDate, // Query using string as stored in Booking
                status: { $in: ['pending', 'confirmed'] }
            }).select('timeSlot -_id');
            const bookedTimeSlotSet = new Set(existingBookedSlots.map(b => b.timeSlot));

            let newSlotsToSave = new Set(availability.timeSlots); // Start with existing slots
            timeSlots.forEach(slot => {
                if (!bookedTimeSlotSet.has(slot)) { // Only add new slots if they aren't currently booked
                    newSlotsToSave.add(slot);
                }
            });

            availability.timeSlots = Array.from(newSlotsToSave).sort((a, b) => a.localeCompare(b)); // Sort alphabetically
            await availability.save();
            return res.status(200).json({ success: true, message: 'Availability updated successfully.', availability: availability.toObject() });
        } else {
            // When creating new availability, filter out any slots that might already be booked
            const existingBookedSlots = await Booking.find({
                property: propertyId,
                date: normalizedDate,
                status: { $in: ['pending', 'confirmed'] }
            }).select('timeSlot -_id');
            const bookedTimeSlotSet = new Set(existingBookedSlots.map(b => b.timeSlot));

            const initialTimeSlots = timeSlots.filter(slot => !bookedTimeSlotSet.has(slot)).sort((a, b) => a.localeCompare(b));

            if (initialTimeSlots.length === 0 && timeSlots.length > 0) {
                return res.status(400).json({ success: false, message: 'All provided time slots are already booked or invalid.' });
            }

            availability = new Availability({
                landlord: landlordId,
                property: propertyId,
                date: new Date(normalizedDate), // Store as Date object in DB
                timeSlots: initialTimeSlots
            });
            await availability.save();
            return res.status(201).json({ success: true, message: 'Availability created successfully.', availability: availability.toObject() });
        }
    } catch (error) {
        console.error('Error in createAvailability:', error);
        if (error.code === 11000) { // MongoDB duplicate key error (if compound unique index on Availability is hit)
            return res.status(409).json({ success: false, message: 'Availability for this property and date already exists. Please update it instead.' });
        }
        res.status(500).json({ success: false, message: 'Server error creating or updating availability.', error: error.message });
    }
};

// @desc    Get all availability entries for the authenticated landlord
// @route   GET /api/calendar/landlord/availabilities
// @access  Private (Landlord)
exports.getLandlordAvailabilities = async (req, res) => {
    const landlordId = req.user._id;

    try {
        const availabilities = await Availability.find({ landlord: landlordId })
            .populate('property', 'title address images')
            .sort({ date: 1, 'timeSlots': 1 }); // Sort by date and then time slots (lexicographically)

        // For consistency, convert date back to 'YYYY-MM-DD' string for frontend
        const formattedAvailabilities = availabilities.map(avail => ({
            ...avail.toObject(),
            date: normalizeDateString(avail.date), // Convert Date object back to string
            timeSlots: avail.timeSlots.sort((a, b) => a.localeCompare(b)) // Ensure sorted
        }));

        res.status(200).json({ success: true, availabilities: formattedAvailabilities });
    } catch (error) {
        console.error('Error in getLandlordAvailabilities:', error);
        res.status(500).json({ success: false, message: 'Server error fetching landlord availabilities.', error: error.message });
    }
};

// @desc    Landlord updates time slots for an existing availability entry.
// @route   PUT /api/calendar/availabilities/:id
// @access  Private (Landlord, and authorized by isOwnerOrRelatedResource middleware)
exports.updateAvailability = async (req, res) => {
    const { id } = req.params;
    const { timeSlots } = req.body;
    const landlordId = req.user._id;

    if (!Array.isArray(timeSlots)) {
        return res.status(400).json({ success: false, message: 'Time slots must be an array.' });
    }

    try {
        const availability = await Availability.findById(id);
        if (!availability || availability.landlord.toString() !== landlordId.toString()) {
            return res.status(404).json({ success: false, message: 'Availability not found or does not belong to you.' });
        }

        const normalizedDate = normalizeDateString(availability.date);

        // Determine which slots are being removed
        const newTimeSlotsSet = new Set(timeSlots);
        const removedSlots = availability.timeSlots.filter(slot => !newTimeSlotsSet.has(slot));

        if (removedSlots.length > 0) {
            // Check for existing active bookings for the slots being removed
            const existingBookings = await Booking.countDocuments({
                property: availability.property,
                date: normalizedDate, // Query using normalized date string
                timeSlot: { $in: removedSlots },
                status: { $in: ['pending', 'confirmed'] }
            });

            if (existingBookings > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot remove time slot(s) that already have pending or confirmed bookings.'
                });
            }
        }

        availability.timeSlots = Array.from(newTimeSlotsSet).sort((a, b) => a.localeCompare(b)); // Filter unique and sort
        await availability.save();

        res.status(200).json({ success: true, message: 'Availability updated successfully.', availability: availability.toObject() });
    } catch (error) {
        console.error('Error in updateAvailability:', error);
        res.status(500).json({ success: false, message: 'Server error updating availability.', error: error.message });
    }
};


exports.deleteAvailability = async (req, res) => {
    const { id } = req.params;
    const landlordId = req.user._id;

    try {
        const availability = await Availability.findById(id);
        if (!availability || availability.landlord.toString() !== landlordId.toString()) {
            return res.status(404).json({ success: false, message: 'Availability not found or does not belong to you.' });
        }

        const normalizedDate = normalizeDateString(availability.date);

        // Check for existing active bookings for any slot on this date
        const existingBookings = await Booking.countDocuments({
            property: availability.property,
            date: normalizedDate, // Query using normalized date string
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingBookings > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete availability because there are existing pending or confirmed bookings for this date. Please cancel bookings first.'
            });
        }

        await availability.deleteOne();
        res.status(200).json({ success: true, message: 'Availability deleted successfully.' });
    } catch (error) {
        console.error('Error in deleteAvailability:', error);
        res.status(500).json({ success: false, message: 'Server error deleting availability.', error: error.message });
    }
};

// --- Tenant Specific Controller Functions ---

exports.getAvailableSlotsForProperty = async (req, res) => {
    const { propertyId } = req.params;
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ success: false, message: 'Date is required to find available slots.' });
    }

    try {
        const normalizedDate = normalizeDateString(date);

        const availability = await Availability.findOne({
            property: propertyId,
            date: new Date(normalizedDate) // Query using Date object
        });

        if (!availability || availability.timeSlots.length === 0) {
            return res.status(200).json({ success: true, availableSlots: [], message: 'No availability found for this date.' });
        }

        // Find all active bookings for this property and date
        const bookedSlots = await Booking.find({
            property: propertyId,
            date: normalizedDate, // Query using normalized date string
            status: { $in: ['pending', 'confirmed'] }
        }).select('timeSlot -_id');

        const bookedTimeSlots = new Set(bookedSlots.map(booking => booking.timeSlot));

        // Filter out booked slots from the landlord's available slots
        const trulyAvailableSlots = availability.timeSlots.filter(
            slot => !bookedTimeSlots.has(slot)
        ).sort((a, b) => a.localeCompare(b)); // Sort for consistent order

        res.status(200).json({
            success: true,
            date: normalizedDate, // Return as string
            availableSlots: trulyAvailableSlots,
            property: propertyId
        });

    } catch (error) {
        console.error('Error in getAvailableSlotsForProperty:', error);
        res.status(500).json({ success: false, message: 'Server error fetching available slots.', error: error.message });
    }
};

// @desc    Book a visit for a property
// @route   POST /api/calendar/book-visit
// @access  Private (Tenant)
exports.bookVisit = async (req, res) => {
    const { propertyId, date, timeSlot } = req.body;
    const tenantId = req.user._id;

    if (!propertyId || !date || !timeSlot) {
        return res.status(400).json({ success: false, message: 'Property ID, date, and time slot are required.' });
    }

    try {
        const normalizedDate = normalizeDateString(date);

        // 1. Verify availability and get landlord ID from Availability
        const availability = await Availability.findOne({
            property: propertyId,
            date: new Date(normalizedDate), // Query with Date object
            timeSlots: timeSlot // Check if the specific time slot is in the array
        });

        if (!availability) {
            return res.status(400).json({ success: false, message: 'The requested time slot is not available or does not exist on the landlord\'s schedule.' });
        }
        const landlordId = availability.landlord; // Get landlord from availability

        // 2. Check if the slot is already booked (pending or confirmed)
        const existingActiveBooking = await Booking.findOne({
            property: propertyId,
            date: normalizedDate,
            timeSlot: timeSlot,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingActiveBooking) {
            return res.status(409).json({ success: false, message: 'This time slot is already booked. Please choose another.' });
        }

        // 3. Prevent tenant from booking the same property at the same time (if they already have a pending/confirmed booking for this exact slot)
        const tenantExistingBooking = await Booking.findOne({
            tenant: tenantId,
            property: propertyId,
            date: normalizedDate,
            timeSlot: timeSlot,
            status: { $in: ['pending', 'confirmed'] }
        });
        if (tenantExistingBooking) {
            return res.status(409).json({ success: false, message: 'You already have an active booking for this specific time slot.' });
        }

        // 4. Create the new booking
        const newBooking = new Booking({
            tenant: tenantId,
            landlord: landlordId, // Assign landlord ID from availability
            property: propertyId,
            date: normalizedDate, // Store as string
            timeSlot: timeSlot,
            status: 'pending' // Initial status
        });

        await newBooking.save();

        // 5. ⭐ IMPORTANT: Remove the booked time slot from the availability ⭐
        availability.timeSlots = availability.timeSlots.filter(slot => slot !== timeSlot);
        await availability.save();

        res.status(201).json({ success: true, message: 'Visit booked successfully! Awaiting landlord confirmation.', booking: newBooking.toObject() });

    } catch (error) {
        console.error('Error in bookVisit:', error);
        if (error.code === 11000) { // MongoDB duplicate key error (if compound unique index on Booking is hit)
            return res.status(409).json({ success: false, message: 'You already have an active booking for this specific time slot.' });
        }
        res.status(500).json({ success: false, message: 'Server error booking visit.', error: error.message });
    }
};


exports.getTenantBookings = async (req, res) => {
    const tenantId = req.user._id;

    try {
        const bookings = await Booking.find({ tenant: tenantId })
            .populate('property', 'title address images')
            .populate('landlord', 'fullName email phoneNumber') // Populate landlord details
            .sort({ date: 1, timeSlot: 1 });

        // Ensure date is returned as YYYY-MM-DD string for consistency with frontend
        const formattedBookings = bookings.map(booking => ({
            ...booking.toObject(),
            date: normalizeDateString(booking.date), // Convert Date object back to string
        }));

        res.status(200).json({ success: true, bookings: formattedBookings });
    } catch (error) {
        console.error('Error in getTenantBookings:', error);
        res.status(500).json({ success: false, message: 'Server error fetching tenant bookings.', error: error.message });
    }
};

// --- Shared/Landlord Management Controller Functions for Bookings ---

// @desc    Get all bookings for the authenticated landlord's properties
// @route   GET /api/calendar/landlord/bookings
// @access  Private (Landlord)
exports.getLandlordBookings = async (req, res) => {
    const userId = req.user._id;

    try {
        const bookings = await Booking.find({
            $or: [
                // Assuming 'landlord' field exists directly on Booking model
                // If not, this part might not match anything, but is harmless if property.landlord is checked below
                { landlord: userId },
                { tenant: userId }
            ]
        })
            .populate('tenant', 'fullName email phoneNumber') // Populate tenant details
            .populate('property', 'title address images')
            .sort({ date: 1, timeSlot: 1 });

        // Ensure date is returned as YYYY-MM-DD string for consistency with frontend
        const formattedBookings = bookings.map(booking => ({
            ...booking.toObject(),
            date: normalizeDateString(booking.date), // Convert Date object back to string
        }));

        res.status(200).json({ success: true, bookings: formattedBookings });
    } catch (error) {
        console.error('Error in getLandlordBookings:', error);
        res.status(500).json({ success: false, message: 'Server error fetching landlord bookings.', error: error.message });
    }
};

exports.updateBookingStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const landlordId = req.user._id;

    // Frontend uses 'Confirmed', 'Rejected', 'Cancelled'. Convert to lowercase for enum.
    const validStatuses = ['pending', 'confirmed', 'rejected', 'cancelled'];
    const newStatus = status.toLowerCase();

    if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid booking status provided.' });
    }

    try {
        const booking = await Booking.findById(id).populate('property'); // Populate property to access landlord ID
        if (!booking || booking.landlord.toString() !== landlordId.toString()) {
            return res.status(404).json({ success: false, message: 'Booking not found or does not belong to your properties.' });
        }

        // Prevent reverting status from confirmed/rejected/cancelled back to pending
        if (booking.status === 'confirmed' && newStatus === 'pending') {
            return res.status(400).json({ success: false, message: 'Cannot revert confirmed booking to pending.' });
        }
        if ((booking.status === 'rejected' || booking.status === 'cancelled') && newStatus === 'pending') {
            return res.status(400).json({ success: false, message: 'Cannot revert cancelled/rejected booking to pending.' });
        }

        const oldStatus = booking.status;
        booking.status = newStatus;
        if ((newStatus === 'rejected' || newStatus === 'cancelled') &&
            (oldStatus === 'pending' || oldStatus === 'confirmed')) {
            // Slot needs to be freed up
            const normalizedDate = normalizeDateString(booking.date);
            const availability = await Availability.findOne({
                property: booking.property,
                date: new Date(normalizedDate) // Query with Date object
            });

            if (availability) {
                // Only add if it's not already in timeSlots to prevent duplicates
                if (!availability.timeSlots.includes(booking.timeSlot)) {
                    availability.timeSlots.push(booking.timeSlot);
                    availability.timeSlots.sort((a, b) => a.localeCompare(b)); // Keep sorted
                    await availability.save();
                    console.log(`Slot ${booking.timeSlot} re-added to availability for property ${booking.property.title} on ${normalizedDate}.`);
                }
            } else {
                console.warn(`Availability for property ${booking.property._id} on ${normalizedDate} not found when updating booking status to ${newStatus}. Slot not re-added.`);
            }
        }
        // No explicit availability update needed if status changes to 'confirmed',
        // as 'bookVisit' already removed the slot.

        await booking.save();

        res.status(200).json({ success: true, message: `Booking status updated to ${newStatus}.`, booking: booking.toObject() });
    } catch (error) {
        console.error('Error in updateBookingStatus:', error);
        res.status(500).json({ success: false, message: 'Server error updating booking status.', error: error.message });
    }
};
exports.deleteBooking = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id; // Current user performing the action

    try {
        const booking = await Booking.findById(id).populate('property'); // Populate property to access landlord ID

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }

        // Authorization: Only the tenant who made the booking or the landlord of the property can cancel/delete
        if (booking.tenant.toString() !== userId.toString() && booking.landlord.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied: You are not authorized to cancel this booking.' });
        }

        const oldStatus = booking.status;

        if (oldStatus === 'completed' || oldStatus === 'rejected' || oldStatus === 'cancelled') {
            return res.status(400).json({ success: false, message: `Booking cannot be cancelled from '${oldStatus}' status.` });
        }

        booking.status = 'cancelled'; // Set status to cancelled
        await booking.save();

        if (oldStatus === 'pending' || oldStatus === 'confirmed') {
            const normalizedDate = normalizeDateString(booking.date);
            const availability = await Availability.findOne({
                property: booking.property._id,
                date: new Date(normalizedDate) // Query with Date object
            });

            if (availability) {
                // Add the time slot back if it's not already there
                if (!availability.timeSlots.includes(booking.timeSlot)) {
                    availability.timeSlots.push(booking.timeSlot);
                    availability.timeSlots.sort((a, b) => a.localeCompare(b)); // Keep sorted
                    await availability.save();
                    console.log(`Slot ${booking.timeSlot} re-added to availability for property ${booking.property.title} on ${normalizedDate} due to booking cancellation.`);
                }
            } else {
                console.warn(`Availability for property ${booking.property._id} on ${normalizedDate} not found when cancelling booking ${id}. Slot not re-added.`);
            }
        }

        res.status(200).json({ success: true, message: 'Booking cancelled successfully.' });

    } catch (error) {
        console.error('Error in deleteBooking:', error);
        res.status(500).json({ success: false, message: 'Server error cancelling booking.', error: error.message });
    }
};