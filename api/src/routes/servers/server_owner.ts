import {
  addMembers,
  removeMembers,
} from "../../controllers/servers/server_member";
import { Router } from "express";

const serverOwnerRouter = Router({ mergeParams: true });

/**
 * @swagger
 * /servers/{serverId}/owner/members:
 *   post:
 *     summary: Add members to a server
 *     description: Add members to a server. Given a list of user IDs, add them to the server.
 *     tags: [Server Owner]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: An array of user IDs to add to the server.
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *           example: ["userId1", "userId2"]
 *     responses:
 *       '204':
 *         description: Successful response with the updated server members.
 *       '401':
 *         $ref: '#/components/responses/AuthMiddlewareError'
 *       '403':
 *         $ref: '#/components/responses/CheckMembershipMiddlewareError'
 *       '404':
 *         $ref: '#/components/responses/CheckOwnerMiddlewareError'
 */
serverOwnerRouter.post("/members", addMembers);

/**
 * @swagger
 * /servers/{serverId}/owner/members:
 *   delete:
 *     summary: Remove members from a server
 *     description: Remove members from a server. Given a list of user IDs, remove them from the server.
 *     tags: [Server Owner]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: An array of IDs of the user to remove from the server.
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *           example: ["userId1", "userId2"]
 *     responses:
 *       '204':
 *         description: Successful response with the updated server members.
 *       '401':
 *         $ref: '#/components/responses/AuthMiddlewareError'
 *       '403':
 *         $ref: '#/components/responses/CheckMembershipMiddlewareError'
 *       '404':
 *         $ref: '#/components/responses/CheckOwnerMiddlewareError'
 */
serverOwnerRouter.delete("/members", removeMembers);

export default serverOwnerRouter;
