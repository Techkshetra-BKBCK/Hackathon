import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/response/appError";
import { ApiResponse } from "../utils/response/apiResponse";
import { logger } from "../config/logger";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error({
    message: error.message,
    stack: error.stack,
    context: "ErrorHandler",
  });

  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const route = req.route?.path || req.path || "/unknown";

  if (error instanceof AppError) {
    ApiResponse.error(res, error.message, error.statusCode);
    return;
  }

  ApiResponse.error(res, "Internal server error", 500);
};

export const errorMiddleware: any = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return errorHandler(err, req, res, next);
};
