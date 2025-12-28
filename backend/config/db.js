const mongoose = require("mongoose");
// Ensure dotenv is loaded here to access process.env variables
require("dotenv").config();

const connectDB = async (testDbUri = null) => {
    let mongoURI;
    if (process.env.NODE_ENV === "test") {
        mongoURI = testDbUri || process.env.MONGO_URI_TEST || "mongodb://localhost:27017/vaultlease_test_db";
        console.log(`Attempting to connect to test MongoDB: ${mongoURI}`);
    } else {
        // For development or production, use the main MONGO_URI
        mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/vaultlease_dev_db";
        console.log(`Attempting to connect to MongoDB: ${mongoURI}`);
    }

    try {
        if (mongoose.connection.readyState === 1 && mongoose.connection.name !== new URL(mongoURI).pathname.substring(1)) {
            console.log(`Disconnecting from ${mongoose.connection.name} before connecting to ${new URL(mongoURI).pathname.substring(1)}`);
            await mongoose.disconnect();
        }

        const conn = await mongoose.connect(mongoURI);

        console.log(`MongoDB connected: ${conn.connection.host} / DB: ${conn.connection.name}`);
        return conn; // Return the connection instance
    } catch (err) {
        console.error(`Error connecting to MongoDB: ${err.message}`);
        if (process.env.NODE_ENV !== "test") {
            process.exit(1);
        }
        throw err; // Re-throw the error so the calling test suite can catch it
    }
};

module.exports = connectDB;