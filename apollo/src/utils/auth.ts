import jwt from "jsonwebtoken";
import UserModel from "../models/user";
import { config } from "../config";

export enum AuthStatus {
  OK = "OK",
  FAILED = "FAILED",
}

export type ValidateTokenResponse = {
  status: AuthStatus;
  user_id?: string;
  message?: string;
};

export const validateToken = async (
  token: string
): Promise<ValidateTokenResponse> => {
  if (!token)
    return { status: AuthStatus.FAILED, message: "Missing auth token" };

  const decoded = jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload;
  const user = await UserModel.findById(decoded.id);
  if (!user) {
    return {
      status: AuthStatus.FAILED,
      message: "The user belonging to this token does no longer exist",
    };
  }

  return { status: AuthStatus.OK, user_id: user.id, message: "Token is valid" };
};
