import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import { SERVER_MESSAGES } from "../constants/messages.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500;
  let message: string = SERVER_MESSAGES.INTERNAL_ERROR;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  if (process.env.NODE_ENV !== "test" && statusCode === 500) {
    console.error("Unhandled Server Error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}
