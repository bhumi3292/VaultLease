const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },

    role: {
        type: String,
        enum: ["Admin", "Administrator", "Student", "ADMINISTRATOR", "ADMIN"],
        required: true,
        default: "Student"
    },

    department: {
        type: String,
        trim: true,
        default: null
    },

    password: {
        type: String,
        required: true,
        minlength: 8
    },

    profilePicture: {
        type: String,
        default: null
    },

    universityId: {
        type: String,
        trim: true
    },

    passwordHistory: [{
        type: String
    }],

    failedLoginAttempts: {
        type: Number,
        default: 0
    },

    passwordChangedAt: {
        type: Date
    },

    otp: {
        type: String
    },

    otpExpires: {
        type: Date
    },

    isMFAEnabled: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });


// ------------------------------
// Hash Password Before Save
// ------------------------------
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});


// ------------------------------
// Compare Password
// ------------------------------
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
