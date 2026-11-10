import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import { UserRepository } from "../repositories/implementations/UserRepository.js";
import { validateRegisterInput, validateLoginInput } from "../validators/auth.validator.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { AUTH_MESSAGES } from "../constants/messages.js";

export class AuthController {
  private readonly authService: AuthService;

  constructor(authService?: AuthService) {
    this.authService = authService || new AuthService(new UserRepository());
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = validateRegisterInput(req.body);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: validation.message,
        });
        return;
      }

      const result = await this.authService.register({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });

      res.status(201).json({
        success: true,
        message: AUTH_MESSAGES.REGISTER_SUCCESS,
        data: result,
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = validateLoginInput(req.body);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: validation.message,
        });
        return;
      }

      const result = await this.authService.login({
        email: req.body.email,
        password: req.body.password,
      });

      res.status(200).json({
        success: true,
        message: AUTH_MESSAGES.LOGIN_SUCCESS,
        data: result,
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          message: AUTH_MESSAGES.UNAUTHORIZED,
        });
        return;
      }

      const user = await this.authService.getUserById(req.user.userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: AUTH_MESSAGES.USER_NOT_FOUND,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at,
          },
        },
      });
    } catch (error: unknown) {
      next(error);
    }
  };
}

export const authController = new AuthController();
