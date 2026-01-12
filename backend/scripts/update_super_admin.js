const mongoose = require("mongoose");
const User = require("../models/User");
const connectDB = require("../config/db");

const updateSuperAdmin = async () => {
    try {
        await connectDB();

        const email = "bhumisubedi2018@gmail.com";
        const newPassword = "admin123";
        // Hex string must be 24 hex characters
        // User provided: 69513236559a4dcefa9791cd (24 chars?)
        // 69513236559a4dcefa9791cd -> length is 24.
        const providedId = "69513236559a4dcefa9791cd";

        console.log(`Searching for user with email: ${email}`);
        let user = await User.findOne({ email });

        if (!user) {
            console.log("User not found. Creating new Super Admin...");
            user = new User({
                _id: new mongoose.Types.ObjectId(providedId),
                email: email,
                fullName: "Super Admin",
                phoneNumber: "9800000000",
                universityId: "ADMIN001",
                role: "ADMIN",
                password: newPassword,
                department: "Administration"
            });
        } else {
            console.log(`User found: ${user.fullName}. Updating...`);
            user.fullName = "Super Admin";
            user.phoneNumber = "9800000000";
            user.universityId = "ADMIN001";
            user.role = "ADMIN";
            // Check if we need to update password (always reset to known one for recovery)
            user.password = newPassword;
            if (!user.department) user.department = "Administration";
        }

        // Reset lock and failures
        user.failedLoginAttempts = 0;
        user.lockUntil = undefined;
        user.isFrozen = false;

        await user.save();

        console.log("---------------------------------------------------");
        console.log(`Super Admin updated successfully: ${email}`);
        console.log(`Role: ${user.role}`);
        console.log(`Password reset to: ${newPassword}`);
        console.log("---------------------------------------------------");

    } catch (error) {
        console.error("Error updating super admin:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
        process.exit(0);
    }
};

updateSuperAdmin();
