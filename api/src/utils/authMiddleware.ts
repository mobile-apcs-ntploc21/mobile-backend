import express from 'express';
import graphQLClient from '../utils/graphql';
import { GET_USER_BY_ID } from '../graphql/queries';
import jwt from 'jsonwebtoken';

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
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not authorized to access this route',
      });
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not authorized to access this route',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
    const user = await getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token does no longer exist',
      });
    }

    // Check if user changed password after the token was issued
    if (user.passwordChangedAt) {
      const changedTimestamp = user.passwordChangedAt / 1000;
      if (decoded.iat < changedTimestamp) {
        return res.status(401).json({
          status: 'fail',
          message: 'User recently changed password, please login again',
        });
      }
    }

    // Save user data to res.locals

    // req.
    req.params.uid = user.id;
    res.locals.uid = user.id;
    res.locals.token = token;
    next();
  } catch (error) {
    next(error);
  }
};
