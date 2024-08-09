import express from "express";
import * as serverBansController from "../controllers/server_bans";

const serverBansRouter = express.Router();

// Assume that we have prefix /API/v1/servers/
serverBansRouter.get("/:serverId/bans", serverBansController.getServerBans);
serverBansRouter.get(
  "/:serverId/bans/:userId",
  serverBansController.getServerBan
);

serverBansRouter.put(
  "/:serverId/bans/:userId",
  serverBansController.createServerBan
);
serverBansRouter.post(
  "/:serverId/bulk-ban",
  serverBansController.createServerBulkBan
);

serverBansRouter.delete(
  "/:serverId/bans/:userId",
  serverBansController.deleteServerBan
);

export default serverBansRouter;
