import { Request, Response, NextFunction, Router } from "express";
import { authMiddleware } from "../utils/authMiddleware";
import * as up from "../controllers/user_profile";

const userProfileRouter = Router();

// Get user profile
userProfileRouter.get("/me", up.getProfile);
userProfileRouter.get("/:userId", up.getProfile);
userProfileRouter.get("/:userId/:serverId", up.getProfile);

// Create user profile
userProfileRouter.post("/:serverId", up.createProfile);

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
userProfileRouter.patch("/", up.updateProfile);
userProfileRouter.patch("/:serverId", up.updateProfile);

// Delete user profile
userProfileRouter.delete("/:serverId", up.deleteProfile);

export default userProfileRouter;
