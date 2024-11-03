"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_1 = require("../controllers/settings");
const settingsRouter = (0, express_1.Router)();
settingsRouter.get("/", settings_1.getSettings);
settingsRouter.put("/", settings_1.updateSettings);
settingsRouter.put("/reset", settings_1.resetSettings);
exports.default = settingsRouter;
