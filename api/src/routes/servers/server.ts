import { Router } from "express";
import { BaseRolePermissions as BRP } from "../../constants/permissions";
import * as serverCtrl from "../../controllers/servers/server";
import {
  getServerMembers,
  joinServer,
  removeSelf,
} from "../../controllers/servers/server_member";
import {
  getUnicodeEmojis,
  getServerEmojisByUser,
} from "../../controllers/emojis";
import {
  getCurrentUserPermissions,
  getRolesAssignedWithMyself,
  getRolesAssignedWithUser,
} from "../../controllers/servers/server_permission";
import { getMessage, searchMessages } from "../../controllers/servers/message";
import { authMiddleware } from "../../utils/authMiddleware";
import { checkMembershipMiddleware } from "../../utils/checkMembershipMiddleware";
import { checkOwnerMiddleware } from "../../utils/checkOwnerMiddleware";
import { checkServerPermissionMiddleware } from "../../utils/checkServerPermissionMiddleware";

import categoryRouter from "./channels/category";
import channelRouter from "./channels/channel";
import serverOwnerRouter from "./server_owner";
import serverRoleRouter from "./server_permission";

const serverRouter = Router();

// ================== Emojis =============================
/**
 * @swagger
 *  /servers/emojis/unicode:
 *    get:
 *      summary: Retrieve all unicode emojis
 *      description: Retrieve all unicode emojis.
 *      tags: [Server Emojis]
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Successful response with the emojis.
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/UnicodeEmoji'
 *        '401':
 *          $ref: '#/components/responses/AuthMiddlewareError'
 */
serverRouter.get("/emojis/unicode", authMiddleware, getUnicodeEmojis);

/**
 * @swagger
 *  /servers/emojis/user/{userId}:
 *    get:
 *      summary: Retrieve all emojis by a user
 *      description: Retrieve all emojis by a user.
 *      tags: [Server Emojis]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - name: userId
 *          in: path
 *          required: true
 *          description: The ID of the user.
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: Successful response with the emojis.
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/ServerEmoji'
 *        '400':
 *          description: Missing user ID.
 *          content:
 *            application/json:
 *              example:
 *                message: User ID is required.
 *        '401':
 *          $ref: '#/components/responses/AuthMiddlewareError'
 */
serverRouter.get("/emojis/user/:userId", authMiddleware, getServerEmojisByUser);

// ================== Members ============================
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

// ================== Server CRUD operations ==================
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
  checkMembershipMiddleware,
  checkServerPermissionMiddleware([BRP.MANAGE_SERVER]),
  serverCtrl.updateServer
);
serverRouter.patch(
  "/:serverId",
  authMiddleware,
  checkMembershipMiddleware,
  checkServerPermissionMiddleware([BRP.MANAGE_SERVER]),
  serverCtrl.updateServer
);

serverRouter.delete(
  "/:serverId",
  authMiddleware,
  checkMembershipMiddleware,
  serverCtrl.deleteServer
);

// ================== Server Invites ==================
serverRouter.get(
  "/:serverId/invite",
  authMiddleware,
  checkMembershipMiddleware,
  checkServerPermissionMiddleware([BRP.MANAGE_INVITE]),
  serverCtrl.getInviteCode
);
serverRouter.post(
  "/:serverId/invite",
  authMiddleware,
  checkMembershipMiddleware,
  checkServerPermissionMiddleware([BRP.MANAGE_INVITE]),
  serverCtrl.createInviteCode
);
serverRouter.delete(
  "/:serverId/invite/",
  authMiddleware,
  checkMembershipMiddleware,
  checkServerPermissionMiddleware([BRP.MANAGE_INVITE]),
  serverCtrl.deleteInviteCode
);

// Ownership transfer
serverRouter.post(
  "/:serverId/transfer-ownership",
  authMiddleware,
  serverCtrl.transferOwnership
);

// ============ Roles ============

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

// ============ Categories and Channels ============

serverRouter.use(
  "/:serverId/categories/",
  authMiddleware,
  checkMembershipMiddleware,
  categoryRouter
);

serverRouter.use(
  "/:serverId/channels/",
  authMiddleware,
  checkMembershipMiddleware,
  channelRouter
);

// ============ Search Messagees ===============
serverRouter.get(
  "/:serverId/messages/search",
  authMiddleware,
  checkMembershipMiddleware,
  searchMessages
);
serverRouter.get(
  "/:serverId/messages/:messageId",
  authMiddleware,
  checkMembershipMiddleware,
  getMessage
);

export default serverRouter;
