import { Router } from "express";
import { authMiddleware } from "../utils/authMiddleware";
import {
  getSettings,
  updateSettings,
  resetSettings,
} from "../controllers/settings";

const settingsRouter = Router();

// Get user settings
settingsRouter.get("/", getSettings);

// Create user settings
// settingsRouter.post("/", createSettings);

// Update user settings
settingsRouter.put("/", updateSettings);

// Restore user settings
settingsRouter.put("/reset/", resetSettings);

// Delete user settings
// settingsRouter.delete("/", deleteSettings);

export default settingsRouter;
