import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import { UserRepository } from "../repositories/implementations/UserRepository.js";
import { validateRegisterInput, validateLoginInput } from "../validators/auth.validator.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { AUTH_MESSAGES } from "../constants/messages.js";
import { HTTP_STATUS } from "../constants/statusCodes.js";

export class AuthController {
  private readonly authService: AuthService;

  constructor(authService?: AuthService) {
    this.authService = authService || new AuthService(new UserRepository());
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = validateRegisterInput(req.body);
      if (!validation.isValid) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message,
        });
        return;
      }

      const response = await this.authService.register({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
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

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = validateLoginInput(req.body);
      if (!validation.isValid) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message,
        });
        return;
      }

      const response = await this.authService.login({
        email: req.body.email,
        password: req.body.password,
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

  getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: AUTH_MESSAGES.UNAUTHORIZED,
        });
        return;
      }

      const response = await this.authService.getUserById(req.user.userId);

      res.status(response.statusCode).json({
        success: true,
        message: response.message,
        data: {
          user: {
            id: response.data?.id,
            name: response.data?.name,
            email: response.data?.email,
            created_at: response.data?.created_at,
          },
        },
      });
    } catch (error: unknown) {
      next(error);
    }
  };
}

export const authController = new AuthController();
