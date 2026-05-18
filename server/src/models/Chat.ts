import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // The LangGraph thread_id we use for the MongoDBSaver
    threadId: {
        type: String,
        required: true,
        unique: true 
    },
    title: {
        type: String,
        default: "New Chat"
    }
}, { timestamps: true });

export const Chat = mongoose.model("Chat", ChatSchema);
