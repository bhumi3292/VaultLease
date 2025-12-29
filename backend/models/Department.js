const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Department name is required"],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    headOfDepartment: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Department = mongoose.model("Department", departmentSchema);

module.exports = Department;
