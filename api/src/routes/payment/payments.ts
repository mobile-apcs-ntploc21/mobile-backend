import { Router } from "express";

import * as paymentCtrl from "@/controllers/payment/payments";
import { authMiddleware } from "@/utils/authMiddleware";

const paymentRouter = Router({ mergeParams: true });

// ====== Swagger Components ======

/**
 * @swagger
 * tags:
 *  name: Payment
 */

// ====== Routes ======

// Initialize VNPay

/**
 * @swagger
 * /payment/create-order:
 *    get:
 *      summary: Create an order for VNPay
 *      tags: [Payment]
 *      responses:
 *        200:
 *          description: Successful create order
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                  message:
 *                    type: string
 *                  data:
 *                    type: object
 *                    properties:
 *                     paymentUrl:
 *                       type: string
 */
paymentRouter.post("/create-order", authMiddleware, paymentCtrl.createOrder);

// Redirect URL

/**
 * @swagger
 * /payment/return:
 *    get:
 *      summary: Return URL
 *      tags: [Payment]
 *      responses:
 *        200:
 *          description: Successful return URL
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  code:
 *                    type: string
 *                  message:
 *                    type: string
 */
paymentRouter.get("/return", paymentCtrl.returnOrder);

// IPN URL
// @ts-ignore
paymentRouter.get("/ipn", paymentCtrl.ipnOrder);

/**
 * @swagger
 * /payment/orders:
 *    get:
 *      summary: Get all orders
 *      tags: [Payment]
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: Successful retrieve all orders
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    id:
 *                      type: string
 *                    user_id:
 *                      type: string
 *                    order_id:
 *                      type: string
 *                    amount:
 *                      type: number
 *                    status:
 *                      type: string
 *                    created_at:
 *                      type: string
 *        401:
 *          $ref: '#/components/responses/AuthMiddlewareError'
 */
paymentRouter.get("/orders", authMiddleware, paymentCtrl.getOrders);

export default paymentRouter;
