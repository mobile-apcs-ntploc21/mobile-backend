import express from "express";
import graphQLClient from "../utils/graphql";
import { CREATE_USER, UPDATE_REFRESH_TOKEN } from "../graphql/mutations";
import { GET_USER_BY_EMAIL, LOGIN_USER } from "../graphql/queries";
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
        message: "User already exists",
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
