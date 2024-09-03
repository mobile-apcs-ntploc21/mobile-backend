import { Router } from "express";
import channelPermissionRouter from "./channel_permission";
import { checkChannelExistenceMiddleware } from "../../../utils/checkChannelExistenceMiddleware";
import { checkServerPermissionMiddleware } from "../../../utils/checkServerPermissionMiddleware";
import {
  BaseRolePermissions as BRP,
  CategoryPermissions,
  ChannelPermissions,
} from "../../../constants/permissions";
import * as channelCtrl from "../../../controllers/servers/channels/channel";

const channelRouter = Router({ mergeParams: true });

// Category Role and User Permissions
channelRouter.use(
  "/:channelId/",
  checkChannelExistenceMiddleware,
  channelPermissionRouter
);

// Channel CRUD operations routes
channelRouter.get("/", channelCtrl.getChannels);
channelRouter.get(
  "/:channelId",
  checkChannelExistenceMiddleware,
  channelCtrl.getChannel
);

channelRouter.post("/", channelCtrl.createChannel);
channelRouter.patch(
  "/:channelId",
  checkChannelExistenceMiddleware,
  channelCtrl.updateChannel
);

channelRouter.delete(
  "/:channelId",
  checkChannelExistenceMiddleware,
  channelCtrl.deleteChannel
);

// Move channel to a new category
channelRouter.patch(
  "/:channelId/move",
  checkChannelExistenceMiddleware,
  channelCtrl.moveChannel
);

export default channelRouter;
