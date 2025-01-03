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
  getReactions,
  reactMessage,
  unreactMessage,
  searchMessages,
  getMessage,
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
directMessageRouter.get("/:userId/messages/search", searchMessages);
directMessageRouter.get("/:userId/messages/:messageId", getMessage);

directMessageRouter.post("/:userId/:messageId/pin", pinMessage);
directMessageRouter.delete("/:userId/:messageId/pin", unpinMessage);

directMessageRouter.get("/:userId/:messageId/reactions", getReactions);
directMessageRouter.post("/:userId/:messageId/reactions", reactMessage);
directMessageRouter.delete("/:userId/:messageId/reactions", unreactMessage);

export default directMessageRouter;
