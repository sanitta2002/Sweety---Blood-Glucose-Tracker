import { Request, Response } from "express";
import { SERVER_MESSAGES } from "../constants/messages.js";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: SERVER_MESSAGES.ROUTE_NOT_FOUND(req.method, req.originalUrl),
  });
}
