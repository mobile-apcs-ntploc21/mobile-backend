import { Router } from "express";
import { checkServerPermissionMiddleware } from "../../../utils/checkServerPermissionMiddleware";
import { checkChannelPermissionMiddleware } from "../../../utils/checkChannelPermissionMiddleware";
import {
  BaseRolePermissions as BRP,
  CategoryPermissions as CP,
  ChannelPermissions as ChP,
} from "../../../constants/permissions";

import * as messageCtrl from "../../../controllers/servers/message";
import { readMessages } from "../../../controllers/servers/last_read";

const messageRouter = Router({ mergeParams: true });

// ====== Swagger Components ======

/**
 * @swagger
 * components:
 *   schemas:
 *     MessageReaction:
 *       type: object
 *       description: A message reaction object
 *       properties:
 *         emoji_id:
 *           type: string
 *           description: The ID of the emoji
 *           example: 0123456789abcdef0123456
 *         count:
 *           type: integer
 *           description: The number of reactions
 *           example: 1
 *         reactors:
 *           type: array
 *           items:
 *             type: string
 *             description: The IDs of the users who reacted to the message
 *             example: [0123456789abcdef01234567]
 *     Message:
 *       type: object
 *       description: A message object
 *       properties:
 *         id:
 *           type: string
 *           description: The message ID
 *           example: 0123456789abcdef01234567
 *         conversation_id:
 *           type: string
 *           description: The ID of the conversation this message belongs to
 *           example: 0123456789abcdef01234567
 *         sender_id:
 *           type: string
 *           description: The ID of the user who sent the message
 *           example: 0123456789abcdef01234567
 *         author:
 *           $ref: '#/components/schemas/UserProfile'
 *         content:
 *           type: string
 *           description: The content of the message
 *           example: Hello, World!
 *         replied_message_id:
 *           type: string
 *           description: The ID of the message this message is replying to
 *           example: 0123456789abcdef01234567
 *         forwarded_message_id:
 *           type: string
 *           description: The ID of the message this message is forwarding to
 *           example: 0123456789abcdef01234567
 *         mention_users:
 *           type: array
 *           items:
 *             type: string
 *             description: The IDs of the users mentioned in the message
 *             example: [0123456789abcdef01234567]
 *         mention_roles:
 *           type: array
 *           items:
 *             type: string
 *             description: The IDs of the roles mentioned in the message
 *             example: [0123456789abcdef01234567]
 *         mention_channels:
 *           type: array
 *           items:
 *             type: string
 *             description: The IDs of the channels mentioned in the message
 *             example: [0123456789abcdef01234567]
 *         emojis:
 *           type: array
 *           items:
 *             type: string
 *             description: The IDs of the emojis used in the message
 *             example: [0123456789abcdef01234567]
 *         reactions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MessageReaction'
 *         replied_message:
 *           $ref: '#/components/schemas/Message'
 *         is_pinned:
 *           type: boolean
 *           description: True if the message is pinned
 *           example: false
 *         is_modified:
 *           type: boolean
 *           description: True if the message is modified
 *           example: false
 */

// ================================

// Get list of messages in a channel
messageRouter.get("/", messageCtrl.getMessages);

// Read messages
messageRouter.post("/read", readMessages);

// Get pinned messages
messageRouter.get("/pins", messageCtrl.getPinnedMessages);

// Create a message
messageRouter.post(
  "/",
  checkChannelPermissionMiddleware([ChP.SEND_MESSAGE]),
  messageCtrl.createMessage
);

// Edit a message
messageRouter.put("/:messageId", messageCtrl.editMessage);

// Delete a message
messageRouter.delete("/:messageId", messageCtrl.deleteMessage);

// Pin a message
messageRouter.post(
  "/:messageId/pin",
  checkChannelPermissionMiddleware([ChP.MANAGE_MESSAGE]),
  messageCtrl.pinMessage
);

// Unpin a message
messageRouter.delete(
  "/:messageId/pin",
  checkChannelPermissionMiddleware([ChP.MANAGE_MESSAGE]),
  messageCtrl.unpinMessage
);

// Get reactions of a message
messageRouter.get("/:messageId/reactions", messageCtrl.getReactions);

// React to a message
messageRouter.post(
  "/:messageId/reactions",
  checkChannelPermissionMiddleware([ChP.ADD_REACTION]),
  messageCtrl.reactMessage
);

// Unreact to a message
messageRouter.delete(
  "/:messageId/reactions",
  checkChannelPermissionMiddleware([ChP.ADD_REACTION]),
  messageCtrl.unreactMessage
);

export default messageRouter;
