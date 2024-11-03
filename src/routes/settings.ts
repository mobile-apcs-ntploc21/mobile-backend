import { Router } from "express";
import {
  getSettings,
  updateSettings,
  resetSettings,
} from "../controllers/settings";

const settingsRouter = Router();

/**
 * @swagger
 * tags:
 *  name: Settings
 *
 * components:
 *   schemas:
 *     UserSettings:
 *       type: object
 *       properties:
 *         theme:
 *           type: string
 *         language:
 *           type: string
 *         friendReqFromEveryone:
 *           type: boolean
 *         friendReqFromFoFriends:
 *           type: boolean
 *         friendReqFromServer:
 *           type: boolean
 *         enableNotif:
 *           type: boolean
 *         notifSound:
 *           type: boolean
 */

/**
 * @swagger
 * /settings:
 *    get:
 *      summary: Get user's settings
 *      tags: [Settings]
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: Successful retrieve user settings
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UserSettings'
 *        400:
 *          description: Bad request
 *          content:
 *            application/json:
 *              example:
 *                message: Settings is not in JSON format !
 *        401:
 *          $ref: '#/components/responses/AuthMiddlewareError'
 */
settingsRouter.get("/", getSettings);

// Create user settings
// settingsRouter.post("/", createSettings);

/**
 * @swagger
 * /settings:
 *    put:
 *      summary: Update user settings
 *      tags: [Settings]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserSettings'
 *      responses:
 *        200:
 *          description: Successful retrieve user settings
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                  settings:
 *                    $ref: '#/components/schemas/UserSettings'
 *        401:
 *          $ref: '#/components/responses/AuthMiddlewareError'
 */
settingsRouter.put("/", updateSettings);

/**
 * @swagger
 * /settings/reset:
 *    put:
 *      summary: Restore default user settings
 *      tags: [Settings]
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: Successful restore user settings
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                  settings:
 *                    $ref: '#/components/schemas/UserSettings'
 *        401:
 *          $ref: '#/components/responses/AuthMiddlewareError'
 */
settingsRouter.put("/reset", resetSettings);

// Delete user settings
// settingsRouter.delete("/", deleteSettings);

export default settingsRouter;
