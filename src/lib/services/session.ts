import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { CustomJWTPayload } from "../../types/system/index";
import { AppError } from "../../utils/response/appError";
import { ErrorCode } from "../../utils/response/errorCodes";

class Session {
  private secretKey: string;
  private cookieOptions: { name: string; options: object; duration: number };

  constructor() {
    this.secretKey = process.env.SECRET_KEY || "default_secret_key";
    this.cookieOptions = {
      name: "session",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
      },
      duration: 24 * 60 * 60 * 1000,
    };
  }

  async encrypt(payload: CustomJWTPayload): Promise<string> {
    try {
      return jwt.sign(payload, this.secretKey, {
        algorithm: "HS256",
        expiresIn: "1d",
      });
    } catch (error) {
      throw new AppError(
        "Failed to encrypt session",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async decrypt(token: string): Promise<CustomJWTPayload | null> {
    try {
      const decoded = jwt.verify(token, this.secretKey, {
        algorithms: ["HS256"],
      });
      return decoded as CustomJWTPayload;
    } catch (error) {
      throw new AppError(
        "Invalid or expired session",
        401,
        ErrorCode.UNAUTHORIZED
      );
    }
  }

  async createSession(userId: string, res: Response): Promise<string> {
    try {
      const expires = Date.now() + this.cookieOptions.duration;
      const session = await this.encrypt({ userId, expires });
      res.cookie(this.cookieOptions.name, session, {
        ...this.cookieOptions.options,
        maxAge: this.cookieOptions.duration,
      });
      return session;
    } catch (error) {
      throw new AppError(
        "Failed to create session",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async verifySession(req: Request, res: Response): Promise<string> {
    try {
      const cookie = req.cookies?.[this.cookieOptions.name];
      if (!cookie) {
        throw new AppError(
          "Session cookie not found",
          404,
          ErrorCode.NOT_FOUND
        );
      }

      const session = await this.decrypt(cookie);
      if (!session || !session.userId) {
        throw new AppError(
          "Invalid or expired session",
          401,
          ErrorCode.UNAUTHORIZED
        );
      }

      return session.userId;
    } catch (error) {
      throw error instanceof AppError
        ? error
        : new AppError(
            "Session verification failed",
            500,
            ErrorCode.INTERNAL_SERVER_ERROR
          );
    }
  }

  async deleteSession(res: Response): Promise<void> {
    try {
      res.clearCookie(this.cookieOptions.name);
    } catch (error) {
      throw new AppError(
        "Failed to delete session",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export default new Session();
