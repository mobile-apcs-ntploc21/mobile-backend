import express from "express";
import * as serverBansController from "../../controllers/servers/server_bans";
import { checkMembershipMiddleware } from "../../utils/checkMembershipMiddleware";
import { checkServerPermissionMiddleware } from "../../utils/checkServerPermissionMiddleware";
import { BaseRolePermissions } from "../../constants/permissions";

const serverBansRouter = express.Router();

// Assume that we have prefix /API/v1/servers/
serverBansRouter.get(
  "/:serverId/bans",
  checkMembershipMiddleware,
  checkServerPermissionMiddleware([BaseRolePermissions.BAN_MEMBER]),
  serverBansController.getServerBans
);
serverBansRouter.get(
  "/:serverId/bans/:userId",
  checkMembershipMiddleware,
  checkServerPermissionMiddleware([BaseRolePermissions.BAN_MEMBER]),
  serverBansController.getServerBan
);

serverBansRouter.put(
  "/:serverId/bans/:userId",
  checkMembershipMiddleware,
  checkServerPermissionMiddleware([BaseRolePermissions.BAN_MEMBER]),
  serverBansController.createServerBan
);
serverBansRouter.post(
  "/:serverId/bulk-ban",
  checkMembershipMiddleware,
  checkServerPermissionMiddleware([BaseRolePermissions.BAN_MEMBER]),
  serverBansController.createServerBulkBan
);

serverBansRouter.delete(
  "/:serverId/bans/:userId",
  checkMembershipMiddleware,
  checkServerPermissionMiddleware([BaseRolePermissions.BAN_MEMBER]),
  serverBansController.deleteServerBan
);

serverBansRouter.put(
  "/:serverId/kick/:userId",
  checkMembershipMiddleware,
  checkServerPermissionMiddleware([BaseRolePermissions.KICK_MEMBER]),
  serverBansController.createServerKick
);

export default serverBansRouter;
