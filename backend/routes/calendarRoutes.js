// vaultlease_backend/routes/calendarRoutes.js

const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const { authenticateUser, requireRole } = require('../middlewares/auth'); // Your consolidated auth & role middleware

const { isOwnerOrRelatedResource } = require('../middlewares/resourceAuthMiddleware'); // Your new resource auth middleware


const Availability = require('../models/calendar');
const Booking = require('../models/Booking');


router.use(authenticateUser); // Apply authenticateUser to all routes within this router

// --- Landlord Calendar Routes ---


router.post('/availabilities',
    requireRole('landlord'), // Ensures only users with 'landlord' role can access
    calendarController.createAvailability
);

router.get('/landlord/availabilities',
    requireRole('landlord'),
    calendarController.getLandlordAvailabilities
);


router.put('/availabilities/:id',
    requireRole('landlord'),
    // Ensures the authenticated landlord is the owner of this specific availability resource
    isOwnerOrRelatedResource(Availability, 'id'),
    calendarController.updateAvailability
);
router.delete('/availabilities/:id',
    requireRole('landlord'),
    // Ensures the authenticated landlord is the owner of this specific availability resource
    isOwnerOrRelatedResource(Availability, 'id'),
    calendarController.deleteAvailability
);

// --- Tenant Calendar Routes ---

router.get('/properties/:propertyId/available-slots',
    calendarController.getAvailableSlotsForProperty
);

router.post('/book-visit',
    calendarController.bookVisit
);

router.get('/tenant/bookings',
    requireRole('tenant'),
    calendarController.getTenantBookings
);


// --- General Booking Management Routes (Accessible by Landlords primarily) ---

router.get('/landlord/bookings',
    requireRole('landlord'),
    calendarController.getLandlordBookings
);

router.put('/bookings/:id/status',
    requireRole('landlord'),
    // Ensures the authenticated landlord is the owner of the property associated with this booking
    isOwnerOrRelatedResource(Booking, 'id'),
    calendarController.updateBookingStatus
);


router.delete('/bookings/:id',
    isOwnerOrRelatedResource(Booking, 'id'),
    calendarController.deleteBooking
);

module.exports = router;