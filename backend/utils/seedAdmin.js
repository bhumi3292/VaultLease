const User = require("../models/User");
const bcrypt = require("bcrypt");

const seedAdmin = async () => {
    try {
        const adminEmail = "bhumisubedi2018@gmail.com";
        const adminPassword = "MainAdmin@gmail.com";
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log("Super Admin already exists. Skipping seed.");
            return;
        }

        // Create new Admin
        const newAdmin = new User({
            fullName: "Super Admin",
            email: adminEmail,
            phoneNumber: "9800000000", // Dummy phone
            role: "ADMIN",
            universityId: "ADMIN001",
            password: adminPassword, // Will be hashed by pre-save hook
            department: "System Administration",
            isMFAEnabled: true,
            passwordHistory: [],
            isVerified: true
        });

        await newAdmin.save();
        console.log("Super Admin created successfully.");

    } catch (error) {
        console.error("Error seeding admin:", error);
    }
};

module.exports = seedAdmin;
