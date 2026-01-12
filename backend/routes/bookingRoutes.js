const express = require("express");
const router = express.Router();

const {
    createBooking,
    getMyBookings,
    getAllBookings,
    updateBookingStatus
} = require("../controllers/bookingController");

const { authenticateUser: protect } = require("../middlewares/auth");

// Admin check middleware
const requireAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'Admin' || req.user.role === 'Administrator' || req.user.role === 'ADMIN' || req.user.role === 'ADMINISTRATOR')) {
        next();
    } else {
        res.status(403).json({ success: false, message: "Admin access required" });
    }
};

// Routes
router.use(protect); // All routes require login

router.post("/create", createBooking);
router.get("/my-bookings", getMyBookings);
router.get("/all", requireAdmin, getAllBookings);
router.put("/:id/status", requireAdmin, updateBookingStatus); // New route for status update

router.get("/test", (req, res) => res.json({ message: "Booking routes working" }));

module.exports = router;
