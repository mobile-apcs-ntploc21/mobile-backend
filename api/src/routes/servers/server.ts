import {Router} from "express";
import {authMiddleware} from "../../utils/authMiddleware";
import {checkServerPermissionMiddleware} from "../../utils/checkServerPermissionMiddleware";
import {BaseRolePermissions as BRP, CategoryPermissions, ChannelPermissions} from "../../constants/permissions";

import * as serverCtrl from "../../controllers/servers/server";
import {getServerMembers, joinServer, removeSelf,} from "../../controllers/servers/server_member";
import {checkMembershipMiddleware} from "../../utils/checkMembershipMiddleware";
import {checkOwnerMiddleware} from "../../utils/checkOwnerMiddleware";
import serverOwnerRouter from "./server_owner";
import serverRoleRouter from "./server_permission";
import {
  getCurrentUserPermissions,
  getRolesAssignedWithMyself,
  getRolesAssignedWithUser,
} from "../../controllers/servers/server_permission";
import {checkCategoryExistenceMiddleware} from "../../utils/checkCategoryExistenceMiddleware";
import categoryRouter from "./channels/category";
import channelRouter from "./channels/channel";
import {checkChannelExistenceMiddleware} from "../../utils/checkChannelExistenceMiddleware";

const serverRouter = Router();

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
serverRouter.put(
  "/:serverId",
  authMiddleware,
  checkServerPermissionMiddleware([BRP.MANAGE_SERVER]),
  serverCtrl.updateServer
);
serverRouter.patch(
  "/:serverId",
  authMiddleware,
  checkServerPermissionMiddleware([BRP.MANAGE_SERVER]),
  serverCtrl.updateServer
);

serverRouter.delete("/:serverId", authMiddleware, serverCtrl.deleteServer);

// Invite Link CRUD operations routes
serverRouter.get(
  "/:serverId/invite",
  authMiddleware,
  checkServerPermissionMiddleware([BRP.MANAGE_INVITE]),
  serverCtrl.getInviteCode
);
serverRouter.post(
  "/:serverId/invite",
  authMiddleware,
  checkServerPermissionMiddleware([BRP.MANAGE_INVITE]),
  serverCtrl.createInviteCode
);
serverRouter.delete(
  "/:serverId/invite/",
  authMiddleware,
  checkServerPermissionMiddleware([BRP.MANAGE_INVITE]),
  serverCtrl.deleteInviteCode
);

// Ownership transfer
serverRouter.post(
  "/:serverId/transfer-ownership",
  authMiddleware,
  serverCtrl.transferOwnership
);

serverRouter.use(
  "/:serverId/roles",
  authMiddleware,
  checkMembershipMiddleware,
  serverRoleRouter
);

serverRouter.get(
  "/:serverId/members/self/roles",
  authMiddleware,
  checkMembershipMiddleware,
  getRolesAssignedWithMyself
);

serverRouter.get(
  "/:serverId/members/:userId/roles",
  authMiddleware,
  checkMembershipMiddleware,
  getRolesAssignedWithUser
);

serverRouter.get(
  "/:serverId/members/self/permissions",
  authMiddleware,
  checkMembershipMiddleware,
  getCurrentUserPermissions
);

serverRouter.use(
  "/:serverId/categories/:categoryId",
  authMiddleware,
  checkMembershipMiddleware,
  checkCategoryExistenceMiddleware,
  categoryRouter
);

serverRouter.use(
  "/:serverId/channels/:channelId",
  authMiddleware,
  checkMembershipMiddleware,
  checkChannelExistenceMiddleware,
  channelRouter
);

export default serverRouter;
