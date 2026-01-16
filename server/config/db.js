import mongoose from "mongoose";

const MongoDBConnect = async (uri) => {
    if (!uri) {
        throw new Error("MongoDB URI is not provided");
    }
    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 30000,
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

export default MongoDBConnect;