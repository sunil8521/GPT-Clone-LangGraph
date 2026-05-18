import express from "express";
import "dotenv/config";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "path";
import { fileURLToPath } from "url";

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
    origin: true, // Allow the same origin
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
        secure: process.env.NODE_ENV === "production"
    }
}));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

// ----------------------------------------------------
// MONOLITHIC DEPLOYMENT: SERVE REACT FRONTEND
// ----------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Tell Express to serve the static files from your React build folder
app.use(express.static(path.join(__dirname, "../../client/dist")));

// 2. Any other route should serve the React index.html so React Router takes over!
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
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