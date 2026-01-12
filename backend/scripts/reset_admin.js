const mongoose = require("mongoose");
const User = require("../models/User");
const connectDB = require("../config/db");

const resetAdmin = async () => {
    try {
        await connectDB();

        const email = "subedibhumi25@gmail.com";
        const newPassword = "admin123";

        console.log(`Searching for user with email: ${email}`);
        const user = await User.findOne({ email });

        if (!user) {
            console.log("User not found!");
            process.exit(1);
        }

        console.log(`User found: ${user.fullName}`);

        // Update password - The pre-save hook in User.js should handle hashing if 'password' is modified
        user.password = newPassword;

        // Ensure role is normalized
        user.role = "ADMINISTRATOR";

        // Also ensure department is set if missing (required for Admin)
        if (!user.department) {
            user.department = "IT"; // Default or existing
        }

        await user.save();

        console.log("---------------------------------------------------");
        console.log(`Password reset successfully for: ${email}`);
        console.log(`New Password: ${newPassword}`);
        console.log(`Role: ${user.role}`);
        console.log("---------------------------------------------------");

    } catch (error) {
        console.error("Error resetting password:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
        process.exit(0);
    }
};

resetAdmin();
