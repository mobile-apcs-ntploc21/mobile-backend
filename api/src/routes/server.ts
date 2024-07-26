import { Request, Response, NextFunction, Router } from "express";
import { authMiddleware } from "../utils/authMiddleware";

import * as serverCtrl from "../controllers/server";

const serverRouter = Router();

// Server CRUD operations routes
serverRouter.get("/list/", authMiddleware, serverCtrl.getUserServers);
serverRouter.get("/:serverId", serverCtrl.getServer);

serverRouter.post("/", authMiddleware, serverCtrl.createServer);
serverRouter.put("/:serverId", authMiddleware, serverCtrl.updateServer);
serverRouter.patch("/:serverId", authMiddleware, serverCtrl.updateServer);

serverRouter.delete("/:serverId", authMiddleware, serverCtrl.deleteServer);

// Invite Link CRUD operations routes
serverRouter.get("/:serverId/invite", authMiddleware, serverCtrl.getInviteCode);
serverRouter.post(
  "/:serverId/invite",
  authMiddleware,
  serverCtrl.createInviteCode
);
serverRouter.delete(
  "/:serverId/invite/",
  authMiddleware,
  serverCtrl.deleteInviteCode
);

// Ownership transfer
serverRouter.post(
  "/:serverId/transfer-ownership",
  authMiddleware,
  serverCtrl.transferOwnership
);

export default serverRouter;
