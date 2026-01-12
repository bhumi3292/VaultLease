const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
    images: {
        type: [String],
        required: true, // will be handled by controller
    },
    videos: {
        type: [String],
        required: false,
    },
    title: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    bedrooms: {
        type: Number,
        required: false
    },
    bathrooms: {
        type: Number,
        required: false
    },
    categoryId: {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
        required: true
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    landlord: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;

