// dreamdwell_backend/models/Booking.js
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.ObjectId,
        ref: 'Property',
        required: true
    },
    tenant: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    landlord: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String,
        required: true
    },
    timeSlot: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true }, // Allows virtuals to be included when converting to JSON
    toObject: { virtuals: true } //toobjects
});


BookingSchema.index({ property: 1, date: 1, timeSlot: 1, tenant: 1 }, {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } }
});

module.exports = mongoose.model('Booking', BookingSchema);