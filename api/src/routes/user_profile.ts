import { Router } from "express";
import * as up from "@/controllers/user_profile";

/**
 * @swagger
 * tags:
 *  name: User profile
 * 
 * components:
 *  schemas:
 *    ExtendedUserProfile:
 *      type: object
 *      properties:
 *        user_id:
 *          type: string
 *        server_id:
 *          type: string
 *        username:
 *          type: string
 *        display_name:
 *          type: string
 *        avatar_url:
 *          type: string
 *        banner_url:
 *          type: string
 *        about_me:
 *          type: string
 *    UserServer:
 *      type: object
 *      properties:
 *        user_id:
 *          type: string
 *        server_id:
 *          type: string
 */

const userProfileRouter = Router();

/**
 * @swagger
 * /profile/me:
 *  get:
 *    summary: Get profile of the authenticated user
 *    tags: [User profile]
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: User profile
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ExtendedUserProfile'
 *      401:
 *        $ref: '#/components/responses/AuthMiddlewareError'
 *      404:
 *        description: User profile not found
 *        content:
 *          application/json:
 *            example:
 *              message: Profile not found.
 */
userProfileRouter.get("/me", up.getProfile);

/**
 * @swagger
 * /profile/u/{username}:
 *  get:
 *    summary: Get user's profile by username
 *    tags: [User profile]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: username
 *        required: true
 *        type: string
 *    responses:
 *      200:
 *        description: User profile
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ExtendedUserProfile'
 *      400:
 *        description: Username is required
 *        content:
 *          application/json:
 *            example:
 *              message: Username is required.
 *      401:
 *        $ref: '#/components/responses/AuthMiddlewareError'
 *      404:
 *        description: Profile with matching username not found
 *        content:
 *          application/json:
 *            example:
 *              message: Profile with matching username not found.
 */
userProfileRouter.get("/u/:username", up.getProfileByUsername);

/**
 * @swagger
 * /profile/{userId}:
 *  get:
 *    summary: Get user profile by user ID
 *    tags: [User profile]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: userId
 *        required: true
 *        type: string
 *    responses:
 *      200:
 *        description: User profile
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ExtendedUserProfile'
 *      401:
 *        $ref: '#/components/responses/AuthMiddlewareError'
 *      404:
 *        description: User profile not found
 *        content:
 *          application/json:
 *            example:
 *              message: Profile not found.
 */
userProfileRouter.get("/:userId", up.getProfile);

/**
 * @swagger
 * /profile/{userId}/{serverId}:
 *  get:
 *    summary: Get user profile in a server
 *    tags: [User profile]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: userId
 *        required: true
 *        type: string
 *      - in: path
 *        name: serverId    
 *        required: true
 *        type: string
 *    responses:
 *      200:
 *        description: User profile
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ExtendedUserProfile'
 *      401:
 *        $ref: '#/components/responses/AuthMiddlewareError'
 *      404:
 *        description: User profile not found
 *        content:
 *          application/json:
 *            example:
 *              message: Profile not found.
 */
userProfileRouter.get("/:userId/:serverId", up.getProfile);

/**
 * @swagger
 * /profile/{serverId}:
 *   post:
 *    summary: Create user profile in a server
 *    tags: [User profile]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: serverId    
 *        required: true
 *        type: string
 *    responses:
 *      200:
 *        description: User profile
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ExtendedUserProfile'
 *      401:
 *        $ref: '#/components/responses/AuthMiddlewareError'
 *      500:
 *        description: Failed to create user profile
 *        content:
 *          application/json:
 *            example:
 *              message: "Server error: User ID is not assigned yet. Please contact the server owner."
 */
userProfileRouter.post("/:serverId", up.createProfile);

// // Upload user profile picture
// userProfileRouter.patch(
//   "/profile/avatar",
//   authMiddleware,
//   up.uploadProfilePicture
// );
// userProfileRouter.patch(
//   "/profile/avatar/:serverId",
//   authMiddleware,
//   up.uploadProfilePicture
// );

// // Upload user profile banner
// userProfileRouter.patch(
//   "/profile/banner",
//   authMiddleware,
//   up.uploadProfileBanner
// );
// userProfileRouter.patch(
//   "/profile/banner/:serverId",
//   authMiddleware,
//   up.uploadProfileBanner
// );

/**
 * @swagger
 * /profile:
 *   patch:
 *    summary: Update user profile
 *    tags: [User profile]
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: User profile
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ExtendedUserProfile'
 *      400:
 *        description: Invalid input
 *        content:
 *          application/json:
 *            examples:
 *              uploadAvatar:
 *                value:
 *                  message: Failed to upload avatar. Maybe check file type.
 *              uploadBanner:
 *                value:
 *                  message: Failed to upload banner. Maybe check file type.
 *      401:
 *        $ref: '#/components/responses/AuthMiddlewareError'
 *      500:
 *        description: Failed to create user profile
 *        content:
 *          application/json:
 *            example:
 *              message: "Server error: User ID is not assigned yet. Please contact the server owner."
 */
userProfileRouter.patch("/", up.updateProfile);

/**
 * @swagger
 * /profile/{serverId}:
 *   patch:
 *    summary: Update user profile in a server
 *    tags: [User profile]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: serverId
 *        required: true
 *        type: string
 *    responses:
 *      200:
 *        description: User profile
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ExtendedUserProfile'
 *      400:
 *        description: Invalid input
 *        content:
 *          application/json:
 *            examples:
 *              uploadAvatar:
 *                value:
 *                  message: Failed to upload avatar. Maybe check file type.
 *              uploadBanner:
 *                value:
 *                  message: Failed to upload banner. Maybe check file type.
 *      401:
 *        $ref: '#/components/responses/AuthMiddlewareError'
 *      500:
 *        description: Failed to create user profile
 *        content:
 *          application/json:
 *            example:
 *              message: "Server error: User ID is not assigned yet. Please contact the server owner."
 */
userProfileRouter.patch("/:serverId", up.updateProfile);

/**
 * @swagger
 * /profile/{serverId}:
 *   delete:
 *    summary: Delete user profile in a server
 *    tags: [User profile]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: serverId
 *        required: true
 *        type: string
 *    responses:
 *      200:
 *        description: User profile
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserServer'
 *      400:
 *        description: Bad request
 *        content:
 *          application/json:
 *            example:
 *              value:
 *                message: User ID is required.
 *      401:
 *        $ref: '#/components/responses/AuthMiddlewareError'
 */
userProfileRouter.delete("/:serverId", up.deleteProfile);

export default userProfileRouter;
