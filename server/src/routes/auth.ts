import { Router } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";

const authRouter:Router = Router();

// Unified Magic Auth Route: Sign In / Sign Up
authRouter.post("/", async (req, res): Promise<any> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        // 1. Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // User exists -> Try to Login
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: "Invalid password" });
            }
        } else {
            // User does not exist -> Create Account (Sign Up)
            const hashedPassword = await bcrypt.hash(password, 10);
            user = await User.create({ email, password: hashedPassword });
        }

        // Setup Express Session
        if (req.session) {
            req.session.userId = user._id.toString();
        }

        return res.json({ 
            success: true, 
            message: "Authenticated successfully",
            user: { id: user._id, email: user.email }
        });

    } catch (error) {
        console.error("Auth Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

authRouter.get("/me", async (req, res): Promise<any> => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }
        
        const user = await User.findById(req.session.userId).select("-password");
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        return res.json({ success: true, user: { id: user._id, email: user.email } });
    } catch (error) {
        console.error("Auth /me Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

authRouter.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid"); // <--- This deletes the cookie from the browser!
        res.json({ success: true, message: "Logged out" });
    });
});

export default authRouter;
