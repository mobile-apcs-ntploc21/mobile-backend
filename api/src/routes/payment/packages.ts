import { Request, Response, NextFunction, Router } from "express";

import * as packagesController from "@/controllers/payment/packages";

const packagesRouter = Router({ mergeParams: true });

// ====== Swagger Components ======

// ====== Routes ======

// Get all packages
packagesRouter.get("/", packagesController.getPackages);

export default packagesRouter;
