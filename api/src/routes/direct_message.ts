import { Router } from "express";
import {
  getDirectMessage,
  getDirectMessages,
  uploadFile,
  getPinnedMessages,
  createMessage,
  deleteMessage,
  editMessage,
  readMessages,
} from "../controllers/direct_message";
import * as messageCtrl from "../controllers/servers/message";

const directMessageRouter = Router();

// Get all DMs
directMessageRouter.get("/me", getDirectMessages);
// Get messages from DM with a user
directMessageRouter.get("/:userId", getDirectMessage);

directMessageRouter.put("/:messageId", editMessage);
directMessageRouter.delete("/:messageId", deleteMessage);

directMessageRouter.post("/:userId", createMessage);
directMessageRouter.post("/:userId/upload", uploadFile);

directMessageRouter.post("/:userId/read", readMessages);
directMessageRouter.get("/:userId/pins", getPinnedMessages);
directMessageRouter.post("/:messageId/pin", messageCtrl.pinMessage);
directMessageRouter.delete("/:messageId/pin", messageCtrl.unpinMessage);

directMessageRouter.get("/:messageId/reactions", messageCtrl.getReactions);
directMessageRouter.post("/:messageId/reactions", messageCtrl.reactMessage);
directMessageRouter.delete("/:messageId/reactions", messageCtrl.unreactMessage);

export default directMessageRouter;
