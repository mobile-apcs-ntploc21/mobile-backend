import { Router } from "express";
import { checkChannelExistenceMiddleware } from "../../../utils/checkChannelExistenceMiddleware";
import { checkServerPermissionMiddleware } from "../../../utils/checkServerPermissionMiddleware";
import { checkChannelPermissionMiddleware } from "../../../utils/checkChannelPermissionMiddleware";
import {
  BaseRolePermissions as BRP,
  CategoryPermissions as CP,
  ChannelPermissions as ChP,
} from "../../../constants/permissions";

import * as messageCtrl from "../../../controllers/servers/message";

const messageRouter = Router({ mergeParams: true });

// Message CRUD operations
messageRouter.get("/", messageCtrl.getMessages);
// Get pinned messages
messageRouter.get("/pins", messageCtrl.getPinnedMessages);

// TODO: Add message CRUD operations

export default messageRouter;
