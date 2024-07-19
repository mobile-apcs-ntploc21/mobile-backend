import express from "express";
import graphQLClient from "../utils/graphql";
import { CREATE_USER, UPDATE_REFRESH_TOKEN } from "../graphql/mutations";
import {
  GET_USER_BY_EMAIL,
  LOGIN_USER,
  GET_USER_BY_USERNAME,
} from "../graphql/queries";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generate JWT token
const generateToken = (payload: any) => {
  return jwt.sign(payload, process.env.JWT_SECRET || "please_add_secret", {
    algorithm: "HS256",
    expiresIn: "1d",
  });
};

// Generate refresh token
const generateRefreshToken = (payload: any) => {
  return jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET || "please_add_secret",
    {
      algorithm: "HS256",
      expiresIn: "7d",
    }
  );
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
    const { username, email, password, phone: phoneNumber } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const user = await getUserByEmail(email)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return null;
      });

    if (user) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const userByUsername = await getUserByUsername(username)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return null;
      });

    if (userByUsername) {
      return res.status(400).json({
        message: "Username already exists",
      });
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
          age: 18,
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

    return res.status(201).json({ ...response, jwtToken, refreshToken });
  } catch (err) {
    return next(err);
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
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const { loginUser: response } = await graphQLClient().request(LOGIN_USER, {
      email: email,
      password: password,
    });

    if (response == null) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
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

    return res.status(200).json({ ...response, jwtToken, refreshToken });
  } catch (err) {
    return next(err);
  }
};

/**
 * @route /refresh - To refresh JWT token
 * Given a valid refresh token, return a new JWT token and refresh token
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
      process.env.REFRESH_TOKEN_SECRET
    ) as jwt.JwtPayload;
    const user = await getUserByEmail(decodedToken.email);

    if (!user || user.token !== refreshToken) {
      return res.status(401).json({
        message: "Invalid token",
      });
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
        token: newRefreshToken,
      },
    });

    return res.status(200).json({
      id: user.id,
      jwtToken: jwtToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    return next(err);
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
    let token: string | undefined;

    // Check if token is in header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else {
      return res.status(401).json({
        status: "fail",
        message: "You are not authorized to access this route",
      });
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not authorized to access this route",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
    const user = await getUserByEmail(decoded.email);

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token does no longer exist",
      });
    }

    return res.status(200).json(user);
  } catch (err) {
    return next(err);
  }
};
