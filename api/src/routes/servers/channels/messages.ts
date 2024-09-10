import { Router } from "express";
import { checkServerPermissionMiddleware } from "../../../utils/checkServerPermissionMiddleware";
import { checkChannelPermissionMiddleware } from "../../../utils/checkChannelPermissionMiddleware";
import {
  BaseRolePermissions as BRP,
  CategoryPermissions as CP,
  ChannelPermissions as ChP,
} from "../../../constants/permissions";

import * as messageCtrl from "../../../controllers/servers/message";

const messageRouter = Router({ mergeParams: true });

// Get list of messages in a channel
messageRouter.get("/", messageCtrl.getMessages);

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
