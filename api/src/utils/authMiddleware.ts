import express from "express";
import graphQLClient from "../utils/graphql";
import { GET_USER_BY_ID } from "../graphql/queries";
import jwt from "jsonwebtoken";
import config from "../config";

// Get user by ID
const getUserById = async (id: string) => {
  const response = await graphQLClient().request(GET_USER_BY_ID, {
    id: id,
  });

  return response.getUserById;
};

export const authMiddleware = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    let token: string | undefined;

    // Check if token is in header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else {
      res.status(401).json({
        status: "fail",
        message: "You are not authorized to access this route",
      });
      return;
    }

    if (!token) {
      res.status(401).json({
        status: "fail",
        message: "You are not authorized to access this route",
      });
      return;
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload;
    const user = await getUserById(decoded.id);
    if (!user) {
      res.status(401).json({
        status: "fail",
        message: "The user belonging to this token does no longer exist",
      });
      return;
    }

    // Check if user changed password after the token was issued
    if (user.passwordChangedAt) {
      const changedTimestamp = user.passwordChangedAt / 1000;
      if (decoded.iat && decoded.iat < changedTimestamp) {
        res.status(401).json({
          status: "fail",
          message: "User recently changed password, please login again",
        });
        return;
      }
    }

    // Save user data to res.locals
    res.locals.uid = user.id;
    res.locals.token = token;
    next();
  } catch (error) {
    next(error);
  }
};
