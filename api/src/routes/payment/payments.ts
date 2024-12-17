import { Router } from "express";

import * as paymentCtrl from "@/controllers/payment/payments";
import { authMiddleware } from "@/utils/authMiddleware";

const paymentRouter = Router({ mergeParams: true });

// ====== Swagger Components ======

// ====== Routes ======

// Initialize VNPay
paymentRouter.post("/create-order", authMiddleware, paymentCtrl.createOrder);

// Redirect URL
paymentRouter.get("/return", paymentCtrl.returnOrder);

// IPN URL
paymentRouter.get("/ipn", paymentCtrl.ipnOrder);

export default paymentRouter;
