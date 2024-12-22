import { Router } from "express";
import {
  getCurrentUserStatus,
  getMultipleUserStatus,
  getUserStatus,
  updateStatusText,
  updateStatusType,
} from "../controllers/user_status";

/**
 * @swagger
 * tags:
 *  name: User status
 *
 * components:
 *  schemas:
 *    StatusType:
 *      type: string
 *      enum:
 *        - ONLINE
 *        - IDLE
 *        - DO_NOT_DISTURB
 *        - INVISIBLE
 *        - OFFLINE
 *
 *    UserStatus:
 *      type: object
 *      properties:
 *        user_id:
 *          type: string
 *        type:
 *          $ref: '#/components/schemas/StatusType'
 *        last_seen:
 *          type: string
 *          format: date-time
 *        status_text:
 *          type: string
 *        is_online:
 *          type: boolean
 */

const userStatusRouter = Router();

/**
 * @swagger
 * /status:
 *    get:
 *      summary: Get status of the sender
 *      tags: [User status]
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: Successful get the user status
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UserStatus'
 *        401:
 *          $ref: '#/components/responses/AuthMiddlewareError'
 */
userStatusRouter.get("/status", getCurrentUserStatus);

/**
 * @swagger
 * /statuses:
 *    get:
 *      summary: Get status of multiple users
 *      tags: [User status]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                user_ids:
 *                  type: array
 *                  items:
 *                    type: string
 *            example:
 *              user_ids: ["uid1", "uid2"]
 *      responses:
 *        200:
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/UserStatus'
 *        401:
 *          $ref: '#/components/responses/AuthMiddlewareError'
 */
userStatusRouter.get("/statuses", getMultipleUserStatus);

/**
 * @swagger
 * /status/{id}:
 *   get:
 *     summary: Get status of the requested user
 *     tags: [User status]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successful get the requested user's status
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/UserStatus'
 *       401:
 *         $ref: '#/components/responses/AuthMiddlewareError'
 */
userStatusRouter.get("/status/:id", getUserStatus);

/**
 * @swagger
 * /status/type:
 *   post:
 *     summary: Update the status's type of the sender
 *     tags: [User status]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                type:
 *                  $ref: '#/components/schemas/StatusType'
 *     responses:
 *       200:
 *         description: Successful update the status type of the sender
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  user_id:
 *                    type: string
 *                  type:
 *                    $ref: '#/components/schemas/StatusType'
 *       401:
 *         $ref: '#/components/responses/AuthMiddlewareError'
 */
userStatusRouter.post("/status/type", updateStatusType);

/**
 * @swagger
 * /status/custom:
 *   post:
 *     summary: Update the status text of the sender
 *     tags: [User status]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status_text:
 *                  type: string
 *     responses:
 *       200:
 *         description: Successful update the status type of the sender
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  user_id:
 *                    type: string
 *                  status_text:
 *                    type: string
 *                  expires_at:
 *                    type: string
 *       401:
 *         $ref: '#/components/responses/AuthMiddlewareError'
 */
userStatusRouter.post("/status/custom", updateStatusText);

export default userStatusRouter;
