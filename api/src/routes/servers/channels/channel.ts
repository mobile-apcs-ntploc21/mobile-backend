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
