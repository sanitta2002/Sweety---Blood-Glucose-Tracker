import { Response, NextFunction } from "express";
import { ReadingService } from "../services/reading.service.js";
import { ReadingRepository } from "../repositories/implementations/ReadingRepository.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  validateCreateReadingInput,
  validateUpdateReadingInput,
} from "../validators/reading.validator.js";
import { READING_MESSAGES, AUTH_MESSAGES } from "../constants/messages.js";
import type { ReadingSlot } from "../types/reading.types.js";

export class ReadingController {
  private readonly readingService: ReadingService;

  constructor(readingService?: ReadingService) {
    this.readingService = readingService || new ReadingService(new ReadingRepository());
  }

  create = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: AUTH_MESSAGES.UNAUTHORIZED });
        return;
      }

      const validation = validateCreateReadingInput(req.body);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: validation.message,
        });
        return;
      }

      const reading = await this.readingService.addReading({
        userId,
        readingDate: req.body.readingDate,
        slot: req.body.slot as ReadingSlot,
        value: Number(req.body.value),
      });

      res.status(201).json({
        success: true,
        message: READING_MESSAGES.CREATED_SUCCESS,
        data: reading,
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  getAll = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: AUTH_MESSAGES.UNAUTHORIZED });
        return;
      }

      const date = typeof req.query.date === "string" ? req.query.date : undefined;
      const startDate = typeof req.query.startDate === "string" ? req.query.startDate : undefined;
      const endDate = typeof req.query.endDate === "string" ? req.query.endDate : undefined;
      const page = req.query.page ? Number(req.query.page) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;

      const result = await this.readingService.getReadings(userId, {
        date,
        startDate,
        endDate,
        page,
        limit,
      });

      res.status(200).json({
        success: true,
        data: result.readings,
        meta: {
          total: result.total,
          page: page || 1,
          limit: limit || result.total,
        },
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  getById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: AUTH_MESSAGES.UNAUTHORIZED });
        return;
      }

      const id = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
      const reading = await this.readingService.getReadingById(id, userId);

      res.status(200).json({
        success: true,
        data: reading,
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  update = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: AUTH_MESSAGES.UNAUTHORIZED });
        return;
      }

      const validation = validateUpdateReadingInput(req.body);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: validation.message,
        });
        return;
      }

      const id = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
      const updated = await this.readingService.updateReading({
        userId,
        id,
        readingDate: req.body.readingDate,
        slot: req.body.slot,
        value: req.body.value !== undefined ? Number(req.body.value) : undefined,
      });

      res.status(200).json({
        success: true,
        message: READING_MESSAGES.UPDATED_SUCCESS,
        data: updated,
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  delete = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: AUTH_MESSAGES.UNAUTHORIZED });
        return;
      }

      const id = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
      await this.readingService.deleteReading(id, userId);

      res.status(200).json({
        success: true,
        message: READING_MESSAGES.DELETED_SUCCESS,
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  getReports = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: AUTH_MESSAGES.UNAUTHORIZED });
        return;
      }

      const selectedDate =
        typeof req.query.date === "string" && req.query.date.trim().length > 0
          ? req.query.date.trim()
          : new Date().toISOString().split("T")[0];

      const report = await this.readingService.getReports(userId, selectedDate);

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error: unknown) {
      next(error);
    }
  };
}

export const readingController = new ReadingController();
