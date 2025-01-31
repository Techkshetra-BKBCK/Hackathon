import { AppError } from "./appError";
import { logger } from "../../config/logger";
import { ErrorCode } from "./errorCodes";
export class ErrorHandler {
  static handle(error: unknown, context: string) {
    if (error instanceof AppError) {
      logger.warn("Application error occurred", {
        message: error.message,
        context,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
        stack: error.stack,
      });
      return error;
    }
    const unknownError = new AppError(
      "Internal server error",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR,
      false
    );
    logger.error("Unknown error occurred", {
      message: error instanceof Error ? error.message : "Unknown error",
      context,
      error: error instanceof Error ? error.stack : JSON.stringify(error),
      details: error instanceof Error ? error : undefined,
    });

    return unknownError;
  }
}
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, ErrorCode.VALIDATION_ERROR);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 500, ErrorCode.DB_ERROR);
  }
}
