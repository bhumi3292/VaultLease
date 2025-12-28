const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Asset name is required"],
        trim: true
    },
    serialNumber: {
        type: String,
        required: [true, "Serial number is required"],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    images: {
        type: [String],
        default: []
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
        required: true
    },

    // Ownership & Location
    administrator: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    department: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: [true, "Asset location is required (e.g., Building C, Room 302)"]
    },

    // Availability & Status
    status: {
        type: String,
        enum: ['Available', 'In Use', 'Maintenance', 'Lost', 'Retired'],
        default: 'Available'
    },
    condition: {
        type: String,
        enum: ['New', 'Good', 'Fair', 'Poor', 'Damaged'],
        default: 'Good'
    },

    // Lending Rules & Fees
    accessFee: {
        type: Number,
        default: 0
    },
    lateFeePerDay: {
        type: Number,
        default: 50
    },
    maxBorrowDurationDays: {
        type: Number,
        default: 7
    }
}, { timestamps: true });

// Text index for searching
assetSchema.index({ name: 'text', description: 'text', serialNumber: 'text' });

const Asset = mongoose.model("Asset", assetSchema);

module.exports = Asset;
