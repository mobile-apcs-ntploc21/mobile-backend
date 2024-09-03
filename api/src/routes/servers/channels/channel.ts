import { Router } from "express";
import channelPermissionRouter from "./channel_permission";
import { checkChannelExistenceMiddleware } from "../../../utils/checkChannelExistenceMiddleware";
import * as channelCtrl from "../../../controllers/servers/channels/channel";

const channelRouter = Router({ mergeParams: true });

// Category Role and User Permissions
channelRouter.use(
  "/:channelId/",
  checkChannelExistenceMiddleware,
  channelPermissionRouter
);

// Channel CRUD operations routes
channelRouter.get("/:channelId", channelCtrl.getChannel);

channelRouter.post("/", channelCtrl.createChannel);
channelRouter.patch("/:channelId", channelCtrl.updateChannel);

channelRouter.delete("/:channelId", channelCtrl.deleteChannel);

// Move channel to a new category
channelRouter.patch("/:channelId/move", channelCtrl.moveChannel);

export default channelRouter;
