import userrepository from "../repository/userrepository";
import { User } from "../types/database/user";
import { AppError } from "../utils/response/appError";
import { ErrorCode } from "../utils/response/errorCodes";
import { HttpStatusCode } from "../utils/response/statusCodes";
import passlib from "../lib/services/passlib";

class UserServices {
  async signup(data: Partial<User>) {
    const { email, name, password } = data;
    try {
      const emailCheck = await userrepository.findOne(email!);
      if (emailCheck) {
        throw new AppError(
          "Email already exists",
          HttpStatusCode.CONFLICT,
          ErrorCode.ALREADY_EXISTS
        );
      }
      const new_password = await passlib.encryptPassword(password!);
      const response = await userrepository.create({
        email,
        name,
        password: new_password,
      });
      if (!response) {
        throw new AppError("Failed to create user", HttpStatusCode.BAD_REQUEST);
      }
      return response;
    } catch (error: any) {
      throw new AppError(
        error.message,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        ErrorCode.SERVICE_UNAVAILABLE,
        false,
        error
      );
    }
  }
  async signin(data: Partial<User>) {
    const { email, password } = data;
    try {
      const response = await userrepository.findOne(email!);
      if (!response) {
        throw new AppError(
          "User not found",
          HttpStatusCode.NOT_FOUND,
          ErrorCode.NOT_FOUND,
          true
        );
      }
      const passwordCheck = await passlib.verifyPassword(
        response.password,
        password as string
      );
      if (!passwordCheck) {
        throw new AppError(
          "Password is incorrect",
          HttpStatusCode.BAD_REQUEST,
          ErrorCode.INVALID_PASSWORD
        );
      }
      return { _id: response._id };
    } catch (error: any) {
      throw new AppError(
        error.message,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        ErrorCode.SERVICE_UNAVAILABLE,
        false,
        error
      );
    }
  }
}

export default new UserServices();
