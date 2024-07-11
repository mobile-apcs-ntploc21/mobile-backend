import express from "express";
import graphQLClient from "../utils/graphql";
import { CREATE_USER } from "../graphql/mutations";
import {
  GET_USER_BY_ID,
  GET_USER_BY_EMAIL,
  LOGIN_USER,
} from "../graphql/queries";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generate JWT token
const generateToken = (payload: any) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "1d",
  });
};

// Generate refresh token
const generateRefreshToken = (payload: any) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    algorithm: "HS256",
    expiresIn: "7d",
  });
};

// Get user by ID
const getUserById = async (id: string) => {
  const response = await graphQLClient().request(GET_USER_BY_ID, {
    id: id,
  });

  return response.getUserById;
};

// Get user by email
const getUserByEmail = async (email: string) => {
  console.log(email);
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

    res.json({ ...response, jwtToken, refreshToken });
    res.locals.data = {
      id: response.id,
    };

    return next();
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

    res.json({ ...response, jwtToken, refreshToken });
    res.locals.data = {
      id: response.id,
    };

    return next();
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
  } catch (err) {
    return next(err);
  }
};
