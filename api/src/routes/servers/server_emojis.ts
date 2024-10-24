import { Request, Response, NextFunction, Router } from "express";
import { checkServerPermissionMiddleware } from "../../utils/checkServerPermissionMiddleware";
import { BaseRolePermissions as BRP } from "../../constants/permissions";

import * as serverEmojiCtrl from "../../controllers/emojis";

const serverRouter = Router({ mergeParams: true });

// ServerEmoji CRUD operations routes
serverRouter.get("/:emojiId", serverEmojiCtrl.getServerEmoji);
serverRouter.get("/", serverEmojiCtrl.getServerEmojis);

serverRouter.post(
  "/",
  checkServerPermissionMiddleware([BRP.CREATE_EXPRESSION]),
  serverEmojiCtrl.createServerEmoji
);
serverRouter.patch(
  "/:emojiId",
  checkServerPermissionMiddleware([BRP.MANAGE_EXPRESSION]),
  serverEmojiCtrl.updateServerEmoji
);

serverRouter.delete(
  "/:emojiId",
  checkServerPermissionMiddleware([BRP.MANAGE_EXPRESSION]),
  serverEmojiCtrl.deleteServerEmoji
);

export default serverRouter;
