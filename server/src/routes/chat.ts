import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { Chat } from "../models/Chat.js";
import { isAuth } from "../middleware/auth.js";
import { getAgent, getCheckpointer } from "../agent.js";

const chatRouter:Router = Router();

// Apply auth middleware to all chat routes
chatRouter.use(isAuth);

// 1. Fetch all chats for the sidebar
chatRouter.get("/", async (req, res) => {
    try {
        const userId = req.session!.userId as string;
        const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });

        res.json({ success: true, chats });
    } catch (error) {
        console.error("Error fetching chats:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


// 3. Get history for a specific chat
chatRouter.get("/:threadId/history", async (req, res): Promise<any> => {
    try {
        const { threadId } = req.params;
        
        // Ensure this user owns the chat
        const userId = req.session!.userId as string;
        const chat = await Chat.findOne({ threadId, userId });
        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        const checkpointer = getCheckpointer();
        const stateTuple = await checkpointer.getTuple({ configurable: { thread_id: threadId } });
        
        // If there's no state yet, it means no messages were sent
        let messages = [];
        if (stateTuple && stateTuple.checkpoint && stateTuple.checkpoint.channel_values && stateTuple.checkpoint.channel_values.messages) {
            messages = stateTuple.checkpoint.channel_values.messages;
        }

        res.json({ success: true, messages });
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


// 2. Create a new chat
chatRouter.post("/", async (req, res) => {
    try {
        const threadId = uuidv4();
        const userId = req.session!.userId as string;
        const newChat = await Chat.create({
            userId,
            threadId: threadId,
            title: "New Chat"
        });
        res.json({ success: true, chat: newChat });
    } catch (error) {
        console.error("Error creating chat:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


// 4. Send a message to the LangGraph agent
chatRouter.post("/:threadId/message", async (req, res): Promise<any> => {
    try {
        const { threadId } = req.params;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: "Message is required" });
        }

        // Verify ownership
        const userId = req.session!.userId as string;
        const chat = await Chat.findOne({ threadId, userId });
        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        const agent = getAgent();
        const config = { configurable: { thread_id: threadId } };

        // Invoke the LangGraph agent
        // The checkpointer automatically saves it to MongoDB
        const result = await agent.invoke(
            { messages: [{ role: "user", content: message }] },
            config
        );

        // Get the latest AI response
        const latestResponse = result.messages[result.messages.length - 1];

        // Update the chat's 'updatedAt' field (and conditionally its title if it's "New Chat")
        let updateData: any = { updatedAt: new Date() };
        if (chat.title === "New Chat") {
            // Give it a generic title or use a tiny LLM call here later to summarize
            updateData.title = message.substring(0, 30) + "...";
        }

        await Chat.findByIdAndUpdate(chat._id, updateData);

        res.json({ 
            success: true, 
            message: latestResponse.content 
        });

    } catch (error) {
        console.error("Agent Error:", error);
        res.status(500).json({ success: false, message: "Failed to communicate with AI" });
    }
});

export default chatRouter;
