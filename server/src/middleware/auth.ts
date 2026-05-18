import type { Request, Response, NextFunction } from "express";

export const isAuth = (req: Request, res: Response, next: NextFunction): any => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }
    next();
};
