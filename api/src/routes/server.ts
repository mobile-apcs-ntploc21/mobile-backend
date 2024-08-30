import { Request, Response, NextFunction, Router } from "express";
import { authMiddleware } from "../utils/authMiddleware";

import * as serverCtrl from "../controllers/server";
import {
  getServerMembers,
  joinServer,
  removeSelf,
} from "../controllers/server_member";
import { checkMembershipMiddleware } from "../utils/checkMembershipMiddleware";
import { checkOwnerMiddleware } from "../utils/checkOwnerMiddleware";
import serverOwnerRouter from "./server_owner";

const serverRouter = Router();

import serverRoleRouter from './servers/server_permission';
import {getRolesAssignedWithMyself, getRolesAssignedWithUser, getCurrentUserPermissions} from "../controllers/servers/server_permission";

// Members
serverRouter.use("/:serverId/owner", checkOwnerMiddleware, serverOwnerRouter);

serverRouter.post("/join", authMiddleware, joinServer);
serverRouter.get(
  "/:serverId/members",
  authMiddleware,
  checkMembershipMiddleware,
  getServerMembers
);
serverRouter.delete(
  "/:serverId/left",
  authMiddleware,
  checkMembershipMiddleware,
  removeSelf
);

// Server CRUD operations routes
serverRouter.get("/list/", authMiddleware, serverCtrl.getUserServers);
serverRouter.get("/:serverId", serverCtrl.getServer);

serverRouter.put("/move", authMiddleware, serverCtrl.moveServer);
serverRouter.patch(
  "/:serverId/favorite",
  authMiddleware,
  serverCtrl.setFavoriteServer
);

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

serverRouter.use('/:serverId/roles',
  authMiddleware,
  checkMembershipMiddleware,
  serverRoleRouter);

serverRouter.get('/:serverId/members/self/roles',
  authMiddleware,
  checkMembershipMiddleware,
  getRolesAssignedWithMyself);

serverRouter.get('/:serverId/members/:userId/roles',
  authMiddleware,
  checkMembershipMiddleware,
  getRolesAssignedWithUser);

serverRouter.get(
  '/:serverId/members/self/permissions',
  authMiddleware,
  checkMembershipMiddleware,
  getCurrentUserPermissions
)

export default serverRouter;
