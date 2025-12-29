const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // Switched to native bcrypt for performance with 12 rounds

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
        enum: ["ADMIN", "ADMINISTRATOR", "REQUESTER"], // ADMIN = Super Admin, ADMINISTRATOR = Staff, REQUESTER = Student/Faculty
        required: true,
    },

    department: {
        type: String,
        trim: true,
        required: function () { return this.role === 'ADMINISTRATOR'; }
    },

    universityId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },

    password: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                // Security: Min 10 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/.test(v);
            },
            message: "Password must be at least 10 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol."
        }
    },

    // Security: Track last 3 passwords to prevent reuse
    passwordHistory: {
        type: [String],
        default: [],
        select: false
    },

    // Security: Track password change time for expiry (90 days)
    passwordChangedAt: {
        type: Date,
        default: Date.now
    },

    profilePicture: {
        type: String,
        default: null
    },

    // Security: Brute-force protection
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    },

    // MFA: OTP fields
    otp: {
        type: String,
        select: false
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
    // Only run if password was modified
    if (!this.isModified("password")) return next();

    try {
        // If updating an existing user (not a new one), check for reuse
        if (!this.isNew) {
            const oldUser = await this.constructor.findById(this._id).select('+password +passwordHistory');

            if (oldUser) {
                // 1. Check against current active password
                const isCurrent = await bcrypt.compare(this.password, oldUser.password);
                if (isCurrent) {
                    throw new Error("Password cannot be the same as the current password.");
                }

                // 2. Check against password history
                if (oldUser.passwordHistory && oldUser.passwordHistory.length > 0) {
                    for (const historyHash of oldUser.passwordHistory) {
                        const isReuse = await bcrypt.compare(this.password, historyHash);
                        if (isReuse) {
                            throw new Error("Password cannot be one of the last 5 used passwords.");
                        }
                    }
                }

                // 3. Update history: [oldPassword, ...oldHistory].slice(0, 3)
                let newHistory = [oldUser.password, ...(oldUser.passwordHistory || [])];
                if (newHistory.length > 5) newHistory = newHistory.slice(0, 5);
                this.passwordHistory = newHistory;
            }
        }

        // Security: Use 12 rounds for hashing
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);

        // Update change timestamp
        this.passwordChangedAt = Date.now();

        next();
    } catch (error) {
        next(error);
    }
});


// ------------------------------
// Compare Password
// ------------------------------
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
