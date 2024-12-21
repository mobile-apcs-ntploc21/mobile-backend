import { Router } from "express";

import * as subscriptionCtrl from "@/controllers/payment/subscriptions";
import { authMiddleware } from "@/utils/authMiddleware";

const subscriptionRouter = Router({ mergeParams: true });

// ====== Swagger Components ======

/**
 * @swagger
 * tags:
 *  name: Subscriptions
 */

/**
 * @swagger
 * /subscriptions:
 *    get:
 *      summary: Get the subscription of the user
 *      tags: [Subscriptions]
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: Successful retrieve user subscription
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    type: string
 *                  user_id:
 *                    type: string
 *                  plan_id:
 *                    type: string
 *                  status:
 *                    type: string
 *                  start_date:
 *                    type: string
 *                  end_date:
 *                    type: string
 *        401:
 *          $ref: '#/components/responses/AuthMiddlewareError'
 */

subscriptionRouter.get(
  "/",
  authMiddleware,
  subscriptionCtrl.getUserSubscription
);

/**
 * @swagger
 * /subscriptions/{id}:
 *    get:
 *      summary: Get the subscription of the user by user_id
 *      tags: [Subscriptions]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          required: true
 *          description: User ID
 *      responses:
 *        200:
 *          description: Successful retrieve user subscription
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    type: string
 *                  user_id:
 *                    type: string
 *                  plan_id:
 *                    type: string
 *                  status:
 *                    type: string
 *                  start_date:
 *                    type: string
 *                  end_date:
 *                    type: string
 *        401:
 *          $ref: '#/components/responses/AuthMiddlewareError'
 */

subscriptionRouter.get(
  "/:id",
  authMiddleware,
  subscriptionCtrl.getUserSubscription
);

export default subscriptionRouter;
