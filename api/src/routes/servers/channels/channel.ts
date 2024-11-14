import { Router } from "express";
import channelPermissionRouter from "./channel_permission";
import messageRouter from "./messages";
import { checkChannelExistenceMiddleware } from "../../../utils/checkChannelExistenceMiddleware";
import { checkServerPermissionMiddleware } from "../../../utils/checkServerPermissionMiddleware";
import { checkChannelPermissionMiddleware } from "../../../utils/checkChannelPermissionMiddleware";
import {
  BaseRolePermissions as BRP,
  CategoryPermissions as CP,
  ChannelPermissions as ChP,
} from "../../../constants/permissions";
import * as channelCtrl from "../../../controllers/servers/channels/channel";

const channelRouter = Router({ mergeParams: true });

// ===== Swagger Components =====

/**
 * @swagger
 * components:
 *   schemas:
 *     Channel:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The Channel ID
 *           example: 0123456789abcdef01234567
 *         server_id:
 *           type: string
 *           description: The Server ID
 *           example: 0123456789abcdef01234567
 *         conversation_id:
 *           type: string
 *           description: The Conversation ID
 *           example: 0123456789abcdef01234567
 *         category_id:
 *           type: string
 *           description: The Category ID
 *           example: 0123456789abcdef01234567
 *         name:
 *           type: string
 *           description: The Channel name
 *           example: General
 *         description:
 *           type: string
 *           description: The Channel description
 *           example: General chat
 *         last_message_id:
 *           type: string
 *           description: The ID of the last message in the Channel
 *           example: null
 *         position:
 *           type: integer
 *           description: The position of the Channel in the Category
 *           example: 0
 *         last_message:
 *           $ref: '#/components/schemas/Message'
 *         has_new_message:
 *           type: boolean
 *           description: True if the Channel has a new message
 *           example: false
 *         number_of_unread_mentions:
 *           type: integer
 *           description: The number of unread mentions in the Channel
 *           example: 0
 *         is_nsfw:
 *           type: boolean
 *           description: True if the Channel is NSFW
 *           example: false
 *         is_archived:
 *           type: boolean
 *           description: True if the Channel is archived
 *           example: false
 *       example:
 *         id: 0123456789abcdef01234567
 *         server_id: 0123456789abcdef01234567
 *         conversation_id: 0123456789abcdef01234567
 *         category_id: 0123456789abcdef01234567
 *         name: general
 *         description: General chat
 *         last_message_id: 0123456789abcdef01234567
 *         position: 0
 *         last_message: null
 *         has_new_message: false
 *         number_of_unread_mentions: 0
 *         is_nsfw: false
 *         is_archived: false
 */

// ==============================

// Move all channel route
channelRouter.patch(
  "/move",
  checkChannelPermissionMiddleware([ChP.MANAGE_CHANNEL]),
  channelCtrl.moveAllChannel
);

// Channel CRUD operations routes
channelRouter.get("/", channelCtrl.getChannels);
channelRouter.get(
  "/:channelId",
  checkChannelExistenceMiddleware,
  checkChannelPermissionMiddleware([ChP.VIEW_CHANNEL]),
  channelCtrl.getChannel
);

channelRouter.post(
  "/",
  checkChannelPermissionMiddleware([ChP.MANAGE_CHANNEL]),
  channelCtrl.createChannel
);
channelRouter.patch(
  "/:channelId",
  checkChannelExistenceMiddleware,
  checkChannelPermissionMiddleware([ChP.MANAGE_CHANNEL]),
  channelCtrl.updateChannel
);

channelRouter.delete(
  "/:channelId",
  checkChannelExistenceMiddleware,
  checkChannelPermissionMiddleware([ChP.MANAGE_CHANNEL]),
  channelCtrl.deleteChannel
);

// Move channel to a new category
channelRouter.patch(
  "/:channelId/move",
  checkChannelExistenceMiddleware,
  checkChannelPermissionMiddleware([ChP.MANAGE_CHANNEL]),
  channelCtrl.moveChannel
);

// Category Role and User Permissions
channelRouter.use(
  "/:channelId/",
  checkChannelExistenceMiddleware,
  channelPermissionRouter
);

// Message routes
channelRouter.use(
  "/:channelId/messages",
  checkChannelExistenceMiddleware,
  checkChannelPermissionMiddleware([ChP.VIEW_CHANNEL]),
  messageRouter
);

export default channelRouter;
