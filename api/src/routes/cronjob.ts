import { Router } from "express";
import {
  handlePremiumExpiration,
  handleUserStatusExpiration,
  handleInviteCodeExpiration,
  cleanupEmoji,
  cleanupAttachment,
} from "@/controllers/cronjob";

const cronjobRouter = Router();

cronjobRouter.get("/clean-premium", handlePremiumExpiration);
cronjobRouter.get("/clean-user-status", handleUserStatusExpiration);
cronjobRouter.get("/clean-invite-code", handleInviteCodeExpiration);
cronjobRouter.get("/clean-emoji", cleanupEmoji);
cronjobRouter.get("/clean-attachments", cleanupAttachment);

export default cronjobRouter;
