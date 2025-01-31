import { Request, Response } from "express";
import userservice from "../services/userservice";
import session from "../lib/services/session";
import { ApiResponse } from "../utils/response/apiResponse";

class UserController {
  async signup(req: Request, res: Response) {
    try {
      const data = req.body;
      const response = await userservice.signup(data);
      const new_session = await session.createSession(
        response._id as string,
        res
      );
      ApiResponse.success(res, new_session, "user signup successfull.");
    } catch (error: any) {
      ApiResponse.error(res, error.message);
    }
  }
  async signIn(req: Request, res: Response) {
    try {
      const data = req.body;
      const response = await userservice.signin(data);
      const new_session = await session.createSession(
        response._id as string,
        res
      );
      ApiResponse.success(res, new_session, "user signin successfull.");
    } catch (error: any) {
      ApiResponse.error(res, error.message);
    }
  }
}

export default new UserController();
