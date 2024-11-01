import { Router } from "express";
import { BaseRolePermissions as BRP } from "../../constants/permissions";
import * as serverCtrl from "../../controllers/servers/server";
import {
  getServerMembers,
  joinServer,
  removeSelf,
} from "../../controllers/servers/server_member";
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

/**
 * @swagger
 * tags:
 *  name: Servers
 *
 * components:
 *  responses:
 *    ServerNotFound:
 *      description: The server was not found
 *      content:
 *        application/json:
 *          example:
 *            message: Server not found.
 *
 *  schemas:
 *    UserProfileServer:
 *      allOf:
 *        - $ref: '#/components/schemas/ExtendedUserProfile'
 *        - type: object
 *          properties:
 *            status:
 *              $ref: '#/components/schemas/UserStatusWithoutId'
 *        - type: object
 *          properties:
 *            roleIds:
 *              type: array
 *              items:
 *                type: string
 *
 *    ServerInfo:
 *      type: object
 *      properties:
 *        id:
 *          type: string
 *          description: The id of the server
 *        owner:
 *          type: string
 *          description: The id of the owner of the server (which is a user id)
 *        name:
 *          type: string
 *          description: The name of the server
 *        avatar_url:
 *          type: string
 *        banner_url:
 *          type: string
 *        totalMembers:
 *          type: integer
 *        totalEmojis:
 *          type: integer
 *        is_favorite:
 *          type: boolean
 *
 *    ServerInfoWithPosition:
 *      allOf:
 *        - $ref: '#/components/schemas/ServerInfo'
 *        - type: object
 *          properties:
 *            position:
 *              type: integer
 *              description: >
 *                The position of the server in the favorite list.
 *                This is for positioning the servers in the frontend.
 *
 *    MoveServerInput:
 *      type: object
 *      properties:
 *        server_id:
 *          type: string
 *        position:
 *          type: integer
 */

const serverRouter = Router();

// Members
serverRouter.use("/:serverId/owner", checkOwnerMiddleware, serverOwnerRouter);

/**
 * @swagger
 * /servers/join:
 *  post:
 *    summary: Join a server
 *    tags: [Servers]
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              url:
 *                type: string
 *                description: The invite code of the server
 *          example:
 *            url: "https://fbi.com/invite/9AKzrDTGKA"
 *    responses:
 *      200:
 *        description: Successfully joined the server
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserServer'
 *      401:
 *        $ref: '#/components/responses/AuthMiddlewareError'
 */
serverRouter.post("/join", authMiddleware, joinServer);

/**
 * @swagger
 * /servers/{serverId}/members:
 *  get:
 *    summary: Get members of a server
 *    tags: [Servers]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: serverId
 *        required: true
 *        description: The id of the server
 *        type: string
 *      - in: query
 *        name: limit
 *        required: false
 *        description: The number of members to return
 *        type: number
 *        default: 1000
 *    responses:
 *      200:
 *        description: Successfully get the members of the server
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/UserProfileServer'
 *      400:
 *        $ref: '#/components/responses/ServerIdRequired'
 *      401:
 *        $ref: '#/components/responses/AuthMiddlewareError'
 *      403:
 *        $ref: '#/components/responses/CheckMembership'
 */
serverRouter.get(
  "/:serverId/members",
  authMiddleware,
  checkMembershipMiddleware,
  getServerMembers
);

/**
 * @swagger
 * /servers/{serverId}/left:
 *  delete:
 *    summary: Leave a server
 *    tags: [Servers]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: serverId
 *        required: true
 *        description: The id of the server
 *        type: string
 *    responses:
 *      200:
 *        description: Successfully left the server
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/UserServer'
 *      400:
 *        $ref: '#/components/responses/ServerIdRequired'
 *      401:
 *        $ref: '#/components/responses/AuthMiddlewareError'
 *      403:
 *        $ref: '#/components/responses/CheckMembership'
 */
serverRouter.delete(
  "/:serverId/left",
  authMiddleware,
  checkMembershipMiddleware,
  removeSelf
);

// ================== Server CRUD operations ==================
/**
 * @swagger
 * /servers/list:
 *  get:
 *    summary: Get servers that the user is a member of
 *    tags: [Servers]
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: Successfully get the servers
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/ServerInfoWithPosition'
 *      401:
 *        $ref: '#/components/responses/AuthMiddlewareError'
 */
serverRouter.get("/list/", authMiddleware, serverCtrl.getUserServers);

/**
 * @swagger
 * /servers/{serverId}:
 *  get:
 *    summary: Get overview of a server
 *    operationId: getServer
 *    tags: [Servers]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: serverId
 *        required: true
 *        description: The id of the server
 *        type: string
 *    responses:
 *      200:
 *        description: Successfully get the servers
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ServerInfo'
 *      400:
 *        $ref: '#/components/responses/ServerIdRequired'
 *      401:
 *        $ref: '#/components/responses/AuthMiddlewareError'
 *      404:
 *        $ref: '#/components/responses/ServerNotFound'
 */
serverRouter.get("/:serverId", serverCtrl.getServer);

/**
 * @swagger
 * /servers/move:
 *  put:
 *    summary: Move servers
 *    tags: [Servers]
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/MoveServerInput'
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            example:
 *              message: Servers moved successfully
 *      400:
 *        content:
 *          application/json:
 *            examples:
 *              serversRequired:
 *                value:
 *                  message: Servers are required.
 *              userIdRequired:
 *                value:
 *                  message: User ID is required.
 *              failedToMoveServers:
 *                value:
 *                  message: Failed to move servers.
 *      401:
 *        $ref: '#/components/responses/AuthMiddlewareError'
 */
serverRouter.put("/move", authMiddleware, serverCtrl.moveServer);

/**
 * @swagger
 * /servers/{serverId}/favorite:
 *  patch:
 *    summary: Move servers
 *    tags: [Servers]
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: false
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              is_favorite:
 *                type: boolean
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            example:
 *              message: Server favorite updated
 *      400:
 *        content:
 *          application/json:
 *            examples:
 *              badRequest:
 *                value:
 *                  message: Server ID and is_favorite are required.
 *              failed:
 *                value:
 *                  message: Failed to update favorite.
 *      401:
 *        $ref: '#/components/responses/AuthMiddlewareError'
 */
serverRouter.patch(
  "/:serverId/favorite",
  authMiddleware,
  serverCtrl.setFavoriteServer
);

/**
 * @swagger
 * /servers:
 *  post:
 *    summary: Create a server
 *    tags: [Servers]
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - name
 *            properties:
 *              name:
 *                type: string
 *                description: The name of the server
 *              avatar:
 *                type: string
 *                description: URL of the server avatar
 *              banner:
 *                type: string
 *                description: URL of the server banner
 *    responses:
 *      201:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ServerInfo'
 *        links:
 *          GetServer:
 *            operationId: getServer
 *            parameters:
 *              serverId: "$response.body#/id"
 *      400:
 *        content:
 *          application/json:
 *            example:
 *              message: Name for the server is required.
 *      401:
 *        $ref: '#/components/responses/AuthMiddlewareError'
 */
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
