import { Request, Response, NextFunction, Router } from "express";
import { checkServerPermissionMiddleware } from "../../utils/checkServerPermissionMiddleware";
import { BaseRolePermissions as BRP } from "../../constants/permissions";

import * as serverEmojiCtrl from "../../controllers/servers/serverEmojis";

const serverRouter = Router();

// ServerEmoji CRUD operations routes
serverRouter.get("/:serverId/emojis/:emojiId", serverEmojiCtrl.getServerEmoji);
serverRouter.get("/:serverId/emojis/", serverEmojiCtrl.getServerEmojis);

serverRouter.post(
  "/:serverId/emojis/",
  checkServerPermissionMiddleware([BRP.CREATE_EXPRESSION]),
  serverEmojiCtrl.createServerEmoji
);
serverRouter.patch(
  "/:serverId/emojis/:emojiId",
  checkServerPermissionMiddleware([BRP.MANAGE_EXPRESSION]),
  serverEmojiCtrl.updateServerEmoji
);

serverRouter.delete(
  "/:serverId/emojis/:emojiId",
  checkServerPermissionMiddleware([BRP.MANAGE_EXPRESSION]),
  serverEmojiCtrl.deleteServerEmoji
);

export default serverRouter;
