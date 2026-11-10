import { Response, NextFunction } from "express";
import { ReadingService } from "../services/reading.service.js";
import { ReadingRepository } from "../repositories/implementations/ReadingRepository.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  validateCreateReadingInput,
  validateUpdateReadingInput,
} from "../validators/reading.validator.js";
import { AUTH_MESSAGES } from "../constants/messages.js";
import { HTTP_STATUS } from "../constants/statusCodes.js";
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
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: AUTH_MESSAGES.UNAUTHORIZED });
        return;
      }

      const validation = validateCreateReadingInput(req.body);
      if (!validation.isValid) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message,
        });
        return;
      }

      const response = await this.readingService.addReading({
        userId,
        readingDate: req.body.readingDate,
        slot: req.body.slot as ReadingSlot,
        value: Number(req.body.value),
      });

      res.status(response.statusCode).json({
        success: true,
        message: response.message,
        data: response.data,
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
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: AUTH_MESSAGES.UNAUTHORIZED });
        return;
      }

      const date = typeof req.query.date === "string" ? req.query.date : undefined;
      const startDate = typeof req.query.startDate === "string" ? req.query.startDate : undefined;
      const endDate = typeof req.query.endDate === "string" ? req.query.endDate : undefined;
      const page = req.query.page ? Number(req.query.page) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;

      const response = await this.readingService.getReadings(userId, {
        date,
        startDate,
        endDate,
        page,
        limit,
      });

      res.status(response.statusCode).json({
        success: true,
        message: response.message,
        data: response.data?.readings ?? [],
        meta: {
          total: response.data?.total ?? 0,
          page: response.data?.page ?? 1,
          limit: response.data?.limit ?? 0,
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
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: AUTH_MESSAGES.UNAUTHORIZED });
        return;
      }

      const id = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
      const response = await this.readingService.getReadingById(id, userId);

      res.status(response.statusCode).json({
        success: true,
        message: response.message,
        data: response.data,
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
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: AUTH_MESSAGES.UNAUTHORIZED });
        return;
      }

      const validation = validateUpdateReadingInput(req.body);
      if (!validation.isValid) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message,
        });
        return;
      }

      const id = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
      const response = await this.readingService.updateReading({
        userId,
        id,
        readingDate: req.body.readingDate,
        slot: req.body.slot,
        value: req.body.value !== undefined ? Number(req.body.value) : undefined,
      });

      res.status(response.statusCode).json({
        success: true,
        message: response.message,
        data: response.data,
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
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: AUTH_MESSAGES.UNAUTHORIZED });
        return;
      }

      const id = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
      const response = await this.readingService.deleteReading(id, userId);

      res.status(response.statusCode).json({
        success: true,
        message: response.message,
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
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: AUTH_MESSAGES.UNAUTHORIZED });
        return;
      }

      const selectedDate =
        typeof req.query.date === "string" && req.query.date.trim().length > 0
          ? req.query.date.trim()
          : new Date().toISOString().split("T")[0];

      const response = await this.readingService.getReports(userId, selectedDate);

      res.status(response.statusCode).json({
        success: true,
        message: response.message,
        data: response.data,
      });
    } catch (error: unknown) {
      next(error);
    }
  };
}

export const readingController = new ReadingController();
