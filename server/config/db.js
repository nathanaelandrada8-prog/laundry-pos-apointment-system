import mongoose from 'mongoose';
import 'dotenv/config'; 

const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        console.error("❌ ERROR: MONGODB_URI is not defined in environment variables. Cannot connect to database.");
        console.error(new Error('MONGODB_URI is missing. Please check your .env file.')); 
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 30000, 
        });

        // console.log(`✅ MongoDB Connected successfully: ${conn.connection.host} | DB: ${conn.connection.name}`);

    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.error(error); 
        process.exit(1);
    }
};

export default connectDB;