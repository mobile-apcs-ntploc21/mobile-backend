import { Router } from "express";

import * as channelCtrl from "../controllers/channel";

const channelRouter = Router();

// Channel CRUD operations routes
channelRouter.get("/channels/", channelCtrl.getChannels);
channelRouter.get("/channels/:channelId", channelCtrl.getChannel);

channelRouter.post("/channels/", channelCtrl.createChannel);
channelRouter.patch("/channels/:channelId", channelCtrl.updateChannel);

channelRouter.delete("/channels/:channelId", channelCtrl.deleteChannel);

// Move channel to a new category
channelRouter.patch("/channels/:channelId/move", channelCtrl.moveChannel);

export default channelRouter;
