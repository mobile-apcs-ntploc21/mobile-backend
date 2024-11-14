import { Request, Response, NextFunction, Router } from "express";
import { checkServerPermissionMiddleware } from "../../utils/checkServerPermissionMiddleware";
import { BaseRolePermissions as BRP } from "../../constants/permissions";

import * as serverEmojiCtrl from "../../controllers/emojis";

const serverRouter = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Server Emojis
 * description: Server Emojis management
 *
 * components:
 *   schemas:
 *     ServerEmoji:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The emoji ID. Encoded in 12-byte ObjectId (refer to MongoDB ObjectId).
 *           example: 0123456789abcdef01234567
 *         name:
 *           type: string
 *           description: The emoji name.
 *           example: smiley
 *           pattern: ^[a-zA-Z0-9_]{2,32}$
 *         image_url:
 *           type: string
 *           description: The emoji image URL.
 *           example: https://example.com/emoji.png
 *         uploader_id:
 *           type: string
 *           description: The emoji's uploader ID.
 *           example: 0123456789abcdef01234567
 *     UnicodeEmoji:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The emoji ID. Encoded in 12-byte ObjectId (refer to MongoDB ObjectId).
 *           example: 0123456789abcdef01234567
 *         unicode:
 *           type: string
 *           description: The unicode emoji.
 *           example: 😊
 *         name:
 *           type: string
 *           description: The emoji name.
 *           example: smiley
 */

/**
 *  @swagger
 *  /servers/{serverId}/emojis/{emojiId}:
 *    get:
 *      summary: Retrieve a specific server emoji
 *      description: Retrieve a specific server emoji by its ID.
 *      tags: [Server Emojis]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - name: emojiId
 *          in: path
 *          required: true
 *          description: The ID of the emoji to retrieve.
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: Successful response with the emoji details.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                $ref: '#/components/schemas/ServerEmoji'
 *        '400':
 *          description: Invalid server ID or invalid emoji ID.
 *          content:
 *            application/json:
 *              example:
 *                message: Server ID and Emoji ID are required.
 *        '404':
 *          description: Emoji not found.
 *          content:
 *            application/json:
 *              example:
 *                message: Emoji not found.
 *        '401':
 *          $ref: '#/components/responses/AuthMiddlewareError'
 *        '500':
 *          description: Internal server error.
 */
serverRouter.get("/:emojiId", serverEmojiCtrl.getServerEmoji);

/**
 * @swagger
 * /servers/{serverId}/emojis:
 *    get:
 *      summary: Retrieve all emojis in a server
 *      description: Use to retrieve all emojis in a server by providing the server ID.
 *      tags: [Server Emojis]
 *      security:
 *       - bearerAuth: []
 *      responses:
 *        200:
 *          description: Successful retrieve server emojis
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                 $ref: '#/components/schemas/ServerEmoji'
 *        400:
 *          description: Invalid server ID or server with given ID not found.
 *          content:
 *            application/json:
 *              example:
 *                message: Server ID is required.
 *        401:
 *          $ref: '#/components/responses/AuthMiddlewareError'
 */
serverRouter.get("/", serverEmojiCtrl.getServerEmojis);

/**
 * @swagger
 * /servers/{serverId}/emojis:
 *    post:
 *      summary: Create a Server Emoji
 *      description: Use to create a server emoji, given all the required fields.
 *      tags: [Server Emojis]
 *      security:
 *       - bearerAuth: []
 *      parameters:
 *       - in: path
 *         name: serverId
 *         required: true
 *         description: The ID of the server to create the emoji in.
 *         type: string
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                  description: The emoji name.
 *                  example: smiley
 *                image_url:
 *                  type: string
 *                  description: The emoji image URL.
 *                  example: https://example.com/emoji.png
 *                uploader_id:
 *                  type: string
 *                  description: The ID of the user who uploaded the emoji.
 *                  example: 0123456789abcdef01234567
 *      responses:
 *        200:
 *          description: Successful create server emoji.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ServerEmoji'
 *        400:
 *          description: Invalid server ID or server with given ID not found.
 *          content:
 *            application/json:
 *              example:
 *                oneOf:
 *                - message: Server ID, name, and image are required.
 *                - message: Server emoji limit reached.
 *                - message: Emoji name already exists.
 *        401:
 *          $ref: '#/components/responses/AuthMiddlewareError'
 *        500:
 *          description: Failed to upload image.
 *          content:
 *            application/json:
 *              example:
 *                message: Failed to upload image.
 */
serverRouter.post(
  "/",
  checkServerPermissionMiddleware([BRP.CREATE_EXPRESSION]),
  serverEmojiCtrl.createServerEmoji
);

/**
 * @swagger
 * /servers/{serverId}/emojis/{emojiId}:
 *    patch:
 *      summary: Update a Server Emoji
 *      description: Use to update a server emoji by providing the emoji ID.
 *      tags: [Server Emojis]
 *      security:
 *       - bearerAuth: []
 *      parameters:
 *        - name: serverId
 *          in: path
 *          required: true
 *          description: The ID of the server to update the emoji in.
 *          schema:
 *            type: string
 *        - name: emojiId
 *          in: path
 *          required: true
 *          description: The ID of the emoji to update.
 *          schema:
 *            type: string
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                  description: The new emoji name to update.
 *                  example: smiley2
 *      responses:
 *        200:
 *          description: Successful update server emoji.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ServerEmoji'
 *        400:
 *          description: Invalid server ID, emoji ID, or name.
 *          content:
 *            application/json:
 *              example:
 *                message: Server ID, emoji ID, and name are required.
 *        401:
 *          $ref: '#/components/responses/AuthMiddlewareError'
 *        404:
 *          description: Emoji not found.
 *          content:
 *            application/json:
 *              example:
 *                message: Emoji not found.
 */
serverRouter.patch(
  "/:emojiId",
  checkServerPermissionMiddleware([BRP.MANAGE_EXPRESSION]),
  serverEmojiCtrl.updateServerEmoji
);

/**
 * @swagger
 * /servers/{serverId}/emojis/{emojiId}:
 *    delete:
 *      summary: Delete a Server Emoji
 *      description: Use to delete a server emoji with the given emoji ID.
 *      tags: [Server Emojis]
 *      security:
 *       - bearerAuth: []
 *      parameters:
 *        - name: serverId
 *          in: path
 *          required: true
 *          description: The ID of the server to delete the emoji from.
 *          schema:
 *            type: string
 *        - name: emojiId
 *          in: path
 *          required: true
 *          description: The ID of the emoji to delete.
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Successful delete server emoji.
 *          content:
 *            application/json:
 *              schema:
 *                type: boolean
 *        400:
 *          description: Invalid server ID or emoji ID.
 *          content:
 *            application/json:
 *              example:
 *                message: Server ID and Emoji ID are required.
 *        401:
 *          $ref: '#/components/responses/AuthMiddlewareError'
 *        404:
 *          description: Emoji not found.
 *          content:
 *            application/json:
 *              example:
 *                message: Emoji not found.
 */
serverRouter.delete(
  "/:emojiId",
  checkServerPermissionMiddleware([BRP.MANAGE_EXPRESSION]),
  serverEmojiCtrl.deleteServerEmoji
);

export default serverRouter;
