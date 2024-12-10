import { Router } from "express";

import * as paymentCtrl from "@/controllers/payment/payments";
import { authMiddleware } from "@/utils/authMiddleware";

const paymentRouter = Router({ mergeParams: true });

// ====== Swagger Components ======

// ====== Routes ======

paymentRouter.post("/create-order", authMiddleware, paymentCtrl.createOrder);

paymentRouter.get("/return", paymentCtrl.returnOrder);

export default paymentRouter;
