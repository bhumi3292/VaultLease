const mongoose = require("mongoose");

const spaceSchema = new mongoose.Schema({
    images: {
        type: [String],
        required: false,
    },
    videos: {
        type: [String],
        required: false,
    },
    roomName: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: false,
    },
    capacity: {
        type: Number,
        required: false,
    },
    departmentId: {
        type: mongoose.Schema.ObjectId,
        ref: "Department",
        required: true
    },
    roomDescription: {
        type: String,
        required: false,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    price: {
        type: Number,
        default: 0
    },
    floorLevel: {
        type: Number,
        default: 0
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    }
}, { timestamps: true });

const Space = mongoose.model("Space", spaceSchema);

module.exports = Space;
