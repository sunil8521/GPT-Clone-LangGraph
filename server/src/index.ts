import express from "express";
import "dotenv/config";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";

import { connectDB } from "./db.js";
import authRouter from "./routes/auth.js";
import chatRouter from "./routes/chat.js";
import { initializeAgent } from "./agent.js";

// Setup Types for express-session
declare module "express-session" {
    interface SessionData {
        userId: string;
    }
}

const app = express();
const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.DB as string

app.use(cors({
    origin: [process.env.CLIENT as string],
    credentials: true
}));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy is required if you are behind a load balancer (like Render/Railway)
// otherwise secure cookies will not be set!
app.set("trust proxy", 1);

// Setup Express Session
app.use(session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: MONGODB_URI,
        dbName: "gpt_clone",
        collectionName: "sessions"
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Must be false on localhost HTTP!
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'none' required for cross-domain cookies
        domain: ".onrender.com"
    }
}));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

app.get("/", (req, res) => {
    res.json({ success: true, message: "GPT Clone API is running" });
});

// Boot Server
const startServer = async () => {
    // 1. Connect Mongoose
    console.log("starting")
    await connectDB();

    // 2. Initialize Agent
    initializeAgent();

    // 3. Start Express
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
};

startServer();