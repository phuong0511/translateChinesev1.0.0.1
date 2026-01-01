import { Request, Response, NextFunction } from "express";
import authService from "./services/auth.service";

export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Middleware to verify JWT token
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const user = authService.verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: "Invalid token" });
  }

  req.user = user;
  next();
}

/**
 * Middleware for error handling
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error("❌ Error:", err);
  res.status(500).json({
    error: err.message || "Internal server error",
  });
}
