import express, { Request, Response } from "express";
import cors from "cors";
import pool from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import readingRoutes from "./routes/reading.routes.js";
import { SERVER_MESSAGES } from "./constants/messages.js";
import { notFoundHandler } from "./middleware/notFound.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: SERVER_MESSAGES.API_RUNNING,
  });
});

app.get("/api/health", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.status(200).json({
      success: true,
      message: SERVER_MESSAGES.DB_CONNECTED,
      time: result.rows[0].now,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: SERVER_MESSAGES.DB_FAILED,
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/readings", readingRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
