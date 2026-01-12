// vaultlease_backend/models/calendar.js
const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({ // <-- First argument: Schema fields
    landlord: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true,
        index: true
    },
    date: {
        type: Date, // Store as actual Date object
        required: true,
        set: function(val) {
            const d = new Date(val);
            d.setUTCHours(0, 0, 0, 0);
            return d;
        },
    },
    timeSlots: [{
        type: String,
        required: true,
        trim: true
    }],
}, {
    timestamps: true,
});

// Add a compound unique index to ensure only one availability entry per property per date
AvailabilitySchema.index({ landlord: 1, property: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Availability', AvailabilitySchema);