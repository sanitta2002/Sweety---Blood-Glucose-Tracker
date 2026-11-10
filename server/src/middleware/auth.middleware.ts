import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AUTH_MESSAGES } from "../constants/messages.js";

const JWT_SECRET: string = process.env.JWT_SECRET || "sweety_jwt_secret_key_change_in_production";

export interface AuthenticatedUser {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: AUTH_MESSAGES.NO_TOKEN_PROVIDED,
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: AUTH_MESSAGES.INVALID_OR_EXPIRED_TOKEN,
    });
  }
}
