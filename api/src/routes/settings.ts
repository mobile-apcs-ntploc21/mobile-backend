import { Router } from "express";
import { authMiddleware } from "../utils/authMiddleware";
import {
  getSettings,
  updateSettings,
  resetSettings,
} from "../controllers/settings";

const settingsRouter = Router();

// Get user settings
settingsRouter.get("/settings/", authMiddleware, getSettings);

// Create user settings
// settingsRouter.post("/settings/", authMiddleware, createSettings);

// Update user settings
settingsRouter.put("/settings/", authMiddleware, updateSettings);

// Restore user settings
settingsRouter.put("/settings/reset/", authMiddleware, resetSettings);

// Delete user settings
// settingsRouter.delete("/settings/", authMiddleware, deleteSettings);

export default settingsRouter;
