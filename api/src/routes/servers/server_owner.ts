import {
  addMembers,
  removeMembers,
} from "../../controllers/servers/server_member";
import { Router } from "express";

const serverOwnerRouter = Router({ mergeParams: true });

serverOwnerRouter.post("/members", addMembers);
serverOwnerRouter.delete("/members", removeMembers);

export default serverOwnerRouter;
