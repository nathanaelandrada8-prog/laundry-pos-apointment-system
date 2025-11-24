import mongoose from 'mongoose';

const connectDB = async () => {
    // 1. Get the MongoDB URI from environment variables
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        console.error("❌ ERROR: MONGODB_URI is not defined in environment variables. Cannot connect to database.");
        // Exit the process if the URI is missing
        process.exit(1);
    }

    try {
        // 2. Connect to MongoDB using Mongoose
        // The options are deprecated/defaulted in modern Mongoose, but kept for clarity if needed:
        // { useNewUrlParser: true, useUnifiedTopology: true }
        const conn = await mongoose.connect(mongoUri);

        console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);

    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // Exit process with failure
        process.exit(1);
    }
};

export default connectDB;