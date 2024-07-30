import { Request, Response, NextFunction, Router } from "express";
import { authMiddleware } from "../utils/authMiddleware";

import * as serverEmojiCtrl from "../controllers/serverEmojis";

const serverRouter = Router();

// ServerEmoji CRUD operations routes
serverRouter.get("/:serverId/emojis/:emojiId", serverEmojiCtrl.getServerEmoji);
serverRouter.get("/:serverId/emojis/", serverEmojiCtrl.getServerEmojis);

serverRouter.post("/:serverId/emojis/", serverEmojiCtrl.createServerEmoji);
serverRouter.patch(
  "/:serverId/emojis/:emojiId",
  serverEmojiCtrl.updateServerEmoji
);

serverRouter.delete(
  "/:serverId/emojis/:emojiId",
  serverEmojiCtrl.deleteServerEmoji
);

export default serverRouter;
