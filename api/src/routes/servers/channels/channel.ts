import {Router} from "express";
import channelPermissionRouter from "./channel_permission";

const channelRouter = Router();

// Category Role and User Permissions
channelRouter.use(
  '/',
  channelPermissionRouter
)

export default channelRouter;
