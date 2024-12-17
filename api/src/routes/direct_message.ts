import { Router } from "express";
import {
  getDirectMessage,
  getDirectMessages,
  uploadFile,
  getPinnedMessages,
  createMessage,
} from "../controllers/direct_message";
import * as messageCtrl from "../controllers/servers/message";

/**
 * @swagger
 * tags:
 *  name: DirectMessage
 *
 * components:
 *  schemas:
 *    UserProfile:
 *      type: object
 *      properties:
 *        user_first_id:
 *          type: string
 *        user_second_id:
 *         type: string
 *        conversation_id:
 *         type: string
 *        lastest_message_id:
 *         type: string
 *        has_new_message:
 *         type: boolean
 *        number_of_unread_mentions:
 *         type: integer
 */

const directMessageRouter = Router();

/**
 * @swagger
 *  /directMessages/{conversationId}:
 *    get:
 *      summary: Retrieve a specific direct message by conversation ID.
 *      description: Retrieve a specific direct message by its conversation ID.
 *      tags: [Direct Messages]
 *      parameters:
 *        - name: conversationId
 *          in: path
 *          required: true
 *          description: The ID of the conversation to retrieve.
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: Successful response with the direct message information.
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/DirectMessage'
 *        '400':
 *          description: Missing conversation ID.
 *          content:
 *            application/json:
 *              example:
 *                message: Conversation ID is required.
 *        '404':
 *          description: Direct message not found.
 *          content:
 *           application/json:
 *              example:
 *                  message: Direct message not found.
 *
 */
directMessageRouter.get("/:userId", getDirectMessage);

/**
 * @swagger
 *  /directMessages/user/{userId}:
 *    get:
 *      summary: Retrieve all direct messages by a user ID.
 *      description: Retrieve all direct messages by a user ID.
 *      tags: [Direct Messages]
 *      parameters:
 *        - name: userId
 *          in: path
 *          required: true
 *          description: The ID of the user.
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: Successful response with the direct messages.
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/DirectMessage'
 *        '400':
 *          description: Missing user ID.
 *          content:
 *            application/json:
 *              example:
 *                message: User ID is required.
 *        '401':
 *          $ref: '#/components/responses/AuthMiddlewareError'
 */
directMessageRouter.get("/me", getDirectMessages);

/**
 * @swagger
 *  /directMessages:
 *    post:
 *      summary:
 *      tags: [Direct Messages]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                user_first_id:
 *                 type: string
 *                user_second_id:
 *                 type: string
 *      responses:
 *        201:
 *          description: Successful login
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  user_first_id:
 *                    type: string
 *                  user_second_id:
 *                    type: string
 *                  conversation_id:
 *                    type: string
 *        400:
 *          description: Missing required fields
 *          content:
 *            application/json:
 *              example:
 *                message: Missing User ID(s)
 */
// directMessageRouter.post("/", createDirectMessage);

/**
 * @swagger
 *  /directMessages/{conversationId}:
 *  delete:
 *    summary: Delete a direct message by conversation ID.
 *    tags: [Direct Messages]
 *    parameters:
 *      - name: conversationId
 *        in: path
 *        required: true
 *        description: The ID of the conversation to delete.
 *        schema:
 *          type: string
 *    responses:
 *      204:
 *        description: Successful response with the direct message information.
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/DirectMessage'
 *      400:
 *        description: Missing conversation ID.
 *        content:
 *          application/json:
 *            example:
 *              message: Conversation ID is required.
 */
// directMessageRouter.delete("/:conversationId", deleteDirectMessage);

directMessageRouter.put("/:messageId", messageCtrl.editMessage);
directMessageRouter.delete("/:messageId", messageCtrl.deleteMessage);
directMessageRouter.post("/:userId", createMessage);
directMessageRouter.post("/upload", uploadFile);
directMessageRouter.get("/pins", getPinnedMessages);
directMessageRouter.post("/:messageId/pin", messageCtrl.pinMessage);
directMessageRouter.delete("/:messageId/pin", messageCtrl.unpinMessage);

directMessageRouter.get("/:messageId/reactions", messageCtrl.getReactions);
directMessageRouter.post("/:messageId/reactions", messageCtrl.reactMessage);
directMessageRouter.delete("/:messageId/reactions", messageCtrl.unreactMessage);

export default directMessageRouter;
