import mongoose from "mongoose";

const MONGODB_URI = process.env.DB as string

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI,{dbName:"gpt_clone"});
        console.log("✅ Mongoose Connected to DB");
    } catch (error) {
        console.error("❌ Mongoose Connection Error:", error);
        process.exit(1);
    }
};

// Export the native MongoClient directly from Mongoose for LangGraph to use!
// This means you do NOT need a separate MongoClient connection.
export const getNativeClient = () => {
    return mongoose.connection.getClient();
};
