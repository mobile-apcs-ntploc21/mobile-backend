import { Request, Response, NextFunction, Router } from "express";
import { authMiddleware } from "../utils/authMiddleware";
import * as up from "../controllers/user_profile";

const userProfileRouter = Router();

// Get user profile
userProfileRouter.get("/profile/me", authMiddleware, up.getProfile);
userProfileRouter.get("/profile/:userId", authMiddleware, up.getProfile);
userProfileRouter.get(
  "/profile/:userId/:serverId",
  authMiddleware,
  up.getProfile
);

// Create user profile
userProfileRouter.post("/profile/:serverId", authMiddleware, up.createProfile);

// // Upload user profile picture
// userProfileRouter.patch(
//   "/profile/avatar",
//   authMiddleware,
//   up.uploadProfilePicture
// );
// userProfileRouter.patch(
//   "/profile/avatar/:serverId",
//   authMiddleware,
//   up.uploadProfilePicture
// );

// // Upload user profile banner
// userProfileRouter.patch(
//   "/profile/banner",
//   authMiddleware,
//   up.uploadProfileBanner
// );
// userProfileRouter.patch(
//   "/profile/banner/:serverId",
//   authMiddleware,
//   up.uploadProfileBanner
// );

// Update user profile
userProfileRouter.patch("/profile/", authMiddleware, up.updateProfile);
userProfileRouter.patch("/profile/:serverId", authMiddleware, up.updateProfile);

// Delete user profile
userProfileRouter.delete(
  "/profile/:serverId",
  authMiddleware,
  up.deleteProfile
);

export default userProfileRouter;
