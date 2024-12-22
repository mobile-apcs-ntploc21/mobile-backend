import { Router } from "express";
import {
  getDirectMessage,
  getDirectMessages,
  uploadFile,
  getPinnedMessages,
  createMessage,
  deleteMessage,
  editMessage,
  pinMessage,
  unpinMessage,
  readMessages,
  unreactMessage,
  searchMessages,
  getMessage,
} from "../controllers/direct_message";

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
directMessageRouter.get("/:userId/messages/search", searchMessages);
directMessageRouter.get("/:userId/messages/:messageId", getMessage);

directMessageRouter.post("/:messageId/pin", pinMessage);
directMessageRouter.delete("/:messageId/pin", unpinMessage);

directMessageRouter.get("/:messageId/reactions", messageCtrl.getReactions);
directMessageRouter.post("/:messageId/reactions", messageCtrl.reactMessage);
directMessageRouter.delete("/:messageId/reactions", unreactMessage);

export default directMessageRouter;
