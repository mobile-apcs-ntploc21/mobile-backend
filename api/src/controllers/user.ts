import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import graphQLClient from "../utils/graphql";
import { CREATE_USER, UPDATE_REFRESH_TOKEN } from "../graphql/mutations";
import {
  GET_USER_BY_EMAIL,
  GET_USER_BY_USERNAME,
  LOGIN_USER,
  LOGOUT_USER,
} from "../graphql/queries";
import config from "../config";

// Generate JWT token
const generateToken = (payload: any) => {
  return jwt.sign(payload, config.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: config.JWT_EXPIRES_IN,
  });
};

// Generate refresh token
const generateRefreshToken = (payload: any) => {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    algorithm: "HS256",
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  });
};

// Get user by email
const getUserByEmail = async (email: string) => {
  const response = await graphQLClient().request(GET_USER_BY_EMAIL, {
    email: email,
  });

  return response.getUserByEmail;
};

// Get user by username
const getUserByUsername = async (username: string) => {
  const response = await graphQLClient().request(GET_USER_BY_USERNAME, {
    username: username,
  });

  return response.getUserByUsername;
};

// ========================================

export const createUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { username, email, password, phone: phoneNumber, age } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({
        message: "Missing required fields",
      });
      return;
    }

    const user = await getUserByEmail(email)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return null;
      });

    if (user) {
      res.status(400).json({
        message: "Email already exists",
      });
      return;
    }

    const userByUsername = await getUserByUsername(username)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return null;
      });

    if (userByUsername) {
      res.status(400).json({
        message: "Username already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const { createUser: response } = await graphQLClient().request(
      CREATE_USER,
      {
        input: {
          name: username,
          username: username,
          email: email,
          password: hashedPassword,
          phone_number: phoneNumber,
          age: age || 18,
        },
      }
    );

    // Generate JWT and refresh token
    const jwtToken = generateToken({
      email: email,
      id: response.id,
    });
    const refreshToken = generateRefreshToken({
      email: email,
      id: response.id,
    });

    // Update refresh token to database
    await graphQLClient().request(UPDATE_REFRESH_TOKEN, {
      input: {
        email: email,
        token: refreshToken,
      },
    });

    res.status(201).json({ ...response, jwtToken, refreshToken });
    return;
  } catch (err) {
    next(err);
    return;
  }
};

/**
 * @route /login - To login user
 * Given a valid email and password, return the user information
 *
 * @async
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {HTML Status | Json}
 */
export const loginUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        message: "Missing required fields",
      });
      return;
    }

    const { loginUser: response } = await graphQLClient().request(LOGIN_USER, {
      email: email,
      password: password,
    });

    if (response == null) {
      res.status(400).json({
        message: "Invalid email or password",
      });
      return;
    }

    // Generate JWT and refresh token
    const jwtToken = generateToken({
      email: email,
      id: response.id,
    });
    const refreshToken = generateRefreshToken({
      email: email,
      id: response.id,
    });

    // Update refresh token to database
    await graphQLClient().request(UPDATE_REFRESH_TOKEN, {
      input: {
        email: email,
        token: refreshToken,
      },
    });

    res.status(200).json({ ...response, jwtToken, refreshToken });
    return;
  } catch (err) {
    next(err);
    return;
  }
};

/**
 * @route /refresh - To refresh JWT token
 * Given a valid refresh token, return a new JWT token and refresh token
 * Also remove the old refresh token from database
 *
 * @async
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {HTML Status | Json}
 */
export const refresh = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { refreshToken } = req.body;
    const decodedToken = jwt.verify(
      refreshToken,
      config.JWT_REFRESH_SECRET
    ) as jwt.JwtPayload;
    const user = await getUserByEmail(decodedToken.email);

    if (!user) {
      res.status(401).json({
        message: "Invalid token",
      });
      return;
    }

    // Generate new JWT and refresh token
    const jwtToken = generateToken({
      email: user.email,
      id: user.id,
    });
    const newRefreshToken = generateRefreshToken({
      email: user.email,
      id: user.id,
    });

    // Update refresh token to database
    await graphQLClient().request(UPDATE_REFRESH_TOKEN, {
      input: {
        email: user.email,
        old_token: refreshToken,
        token: newRefreshToken,
      },
    });

    res.status(200).json({
      id: user.id,
      jwtToken: jwtToken,
      refreshToken: newRefreshToken,
    });
    return;
  } catch (err) {
    next(err);
    return;
  }
};

/**
 * @route /me - To get user information
 * Given a valid JWT token, return the user information
 *
 * @async
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {HTML Status | Json} - User information
 */
export const getMe = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const token = res.locals.token;

    const decoded = jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload;
    const user = await getUserByEmail(decoded.email);

    if (!user) {
      res.status(401).json({
        status: "fail",
        message: "The user belonging to this token does no longer exist",
      });
      return;
    }

    res.status(200).json(user);
    return;
  } catch (err) {
    next(err);
    return;
  }
};

/**
 * To log out user, remove the current user refresh token from database
 *
 * @async
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {unknown}
 */
export const logoutUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { refreshToken } = req.body;
    const user_id = res.locals.uid;

    if (!refreshToken) {
      res.status(400).json({
        message: "Missing required fields",
      });
      return;
    }

    await graphQLClient().request(LOGOUT_USER, {
      user_id: user_id,
      refresh_token: refreshToken,
    });

    res.status(200).json({
      message: "Logout success",
    });
    return;
  } catch (err) {
    next(err);
    return;
  }
};
