import { Request, Response, NextFunction, Router } from "express";
import {
  createUser,
  loginUser,
  refresh,
  getMe,
  logoutUser,
} from "../controllers/user";
import { authMiddleware } from "../utils/authMiddleware";
const userRouter = Router();

/**
 * @swagger
 * tags:
 *  name: Users
 */

/**
 * @swagger
 * /users/me:
 *    get:
 *      summary: Given a valid JWT token, return the user information
 *      tags: [Users]
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: Successful retrieve user information
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    type: string
 *                  username:
 *                    type: string
 *                  email:
 *                    type: string
 *                  phone_number:
 *                    type: string
 *        401:
 *          $ref: '#/components/responses/AuthMiddlewareError'
 */
userRouter.get("/me", authMiddleware, getMe);

/**
 * @swagger
 *  /users/register:
 *    post:
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - username
 *                - email
 *                - password
 *              properties:
 *                username:
 *                  type: string
 *                email:
 *                  type: string
 *                password:
 *                  type: string
 *                phone:
 *                  type: string
 *                age:
 *                  type: integer
 *      responses:
 *        201:
 *          description: Successful register
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    type: string
 *                  username:
 *                    type: string
 *                  email:
 *                    type: string
 *                  phone_number:
 *                    type: string
 *                    nullable: true
 *                  created_at:
 *                    type: string
 *                  last_modified:
 *                    type: string
 *                  jwtToken:
 *                    type: string
 *                  refreshToken:
 *                    type: string
 *        400:
 *          content:
 *            application/json:
 *              examples:
 *                missingFields:
 *                  value:
 *                    message: Missing required fields
 *                duplicateEmail:
 *                  value:
 *                    message: Email already exists
 *                duplicateUsername:
 *                  value:
 *                    message: Username already exists
 */
userRouter.post("/register", createUser);

/**
 * @swagger
 *  /users/login:
 *    post:
 *      summary: Given a valid email and password, return the user information
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                password:
 *                  type: string
 *      responses:
 *        200:
 *          description: Successful login
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    type: string
 *                    description: User ID
 *                  username:
 *                    type: string
 *                  email:
 *                    type: string
 *                  phone_number:
 *                    type: string
 *                    nullable: true
 *                  jwtToken:
 *                    type: string
 *                  refreshToken:
 *                    type: string
 *        400:
 *          content:
 *            application/json:
 *              examples:
 *                missingFields:
 *                  value:
 *                    message: Missing required fields
 *                invalidCredentials:
 *                  value:
 *                   message: Invalid email or password
 */
userRouter.post("/login", loginUser);

/**
 * @swagger
 * /users/refresh:
 *    post:
 *      summary: Given a valid refresh token, return a new JWT token and refresh token.
 *                Also remove the old refresh token from database
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                refreshToken:
 *                  type: string
 *      responses:
 *        200:
 *          description: Successful login
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    type: string
 *                    description: User ID
 *                  jwtToken:
 *                    type: string
 *                  refreshToken:
 *                    type: string
 *        401:
 *          description: Invalid token
 *          content:
 *            application/json:
 *              example:
 *                message: Invalid token
 */
userRouter.post("/refresh", refresh);

/**
 * @swagger
 * /users/logout:
 *    post:
 *      summary: To log out user, remove the current user refresh token from database
 *      tags: [Users]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                refreshToken:
 *                  type: string
 *      responses:
 *        200:
 *          description: Successful logout
 *          content:
 *            application/json:
 *              example:
 *                message: Logout success
 *        400:
 *          description: Bad request
 *          content:
 *            application/json:
 *              example:
 *                message: Missing required fields
 *        401:
 *          $ref: '#/components/responses/AuthMiddlewareError'
 */
userRouter.post("/logout", authMiddleware, logoutUser);

// Clear all devices
// userRouter.delete("/logout", authMiddleware);

export default userRouter;
