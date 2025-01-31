import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/response/appError";
import { ErrorCode } from "../utils/response/errorCodes";
import { logger } from "../config/logger";
import { CustomJWTPayload } from "../types/system";
import session from "../lib/services/session";

declare global {
  namespace Express {
    interface Request {
      user: CustomJWTPayload;
    }
  }
}

export const AuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tokenFromCookie = req.cookies.session;

    const tokenFromHeader = req.headers.session as string;

    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      throw new AppError("No token provided", 401, ErrorCode.UNAUTHORIZED);
    }

    try {
      const decoded = await session.decrypt(token);
      if (!decoded) {
        throw new AppError(
          "Invalid or expired session",
          401,
          ErrorCode.UNAUTHORIZED
        );
      }

      req.user = decoded;
      next();
    } catch (error) {
      logger.warn({
        message: "Invalid token",
        context: "AuthMiddleware.requireAuth",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw new AppError(
        "Unauthorized - Invalid token",
        401,
        ErrorCode.INVALID_TOKEN
      );
    }
  } catch (error) {
    next(error);
  }
};
