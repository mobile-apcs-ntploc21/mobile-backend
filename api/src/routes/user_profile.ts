import { Request, Response, NextFunction, Router } from "express";
import { authMiddleware } from "../utils/authMiddleware";
import * as up from "../controllers/user_profile";

const userProfileRouter = Router();

// Get user profile
userProfileRouter.get("/profile/:userId", authMiddleware, up.getProfile);
userProfileRouter.get(
  "/profile/:userId/:serverId",
  authMiddleware,
  up.getProfile
);

// Create user profile
userProfileRouter.post(
  "/profile/:userId/:serverId",
  authMiddleware,
  up.createProfile
);

// Upload user profile picture
userProfileRouter.put(
  "/profile/avatar",
  authMiddleware,
  up.uploadProfilePicture
);

// Upload user profile banner
userProfileRouter.put(
  "/profile/banner",
  authMiddleware,
  up.uploadProfileBanner
);

// Update user profile (String based)
userProfileRouter.put("/profile/", authMiddleware, up.updateProfile);
userProfileRouter.put("/profile/:serverId", authMiddleware, up.updateProfile);

// Delete user profile
userProfileRouter.delete(
  "/profile/:serverId",
  authMiddleware,
  up.deleteProfile
);

export default userProfileRouter;
