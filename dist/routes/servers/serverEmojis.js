"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checkServerPermissionMiddleware_1 = require("../../utils/checkServerPermissionMiddleware");
const permissions_1 = require("../../constants/permissions");
const serverEmojiCtrl = __importStar(require("../../controllers/servers/serverEmojis"));
const serverRouter = (0, express_1.Router)({ mergeParams: true });
serverRouter.get("/:emojiId", serverEmojiCtrl.getServerEmoji);
serverRouter.get("/", serverEmojiCtrl.getServerEmojis);
serverRouter.post("/", (0, checkServerPermissionMiddleware_1.checkServerPermissionMiddleware)([permissions_1.BaseRolePermissions.CREATE_EXPRESSION]), serverEmojiCtrl.createServerEmoji);
serverRouter.patch("/:emojiId", (0, checkServerPermissionMiddleware_1.checkServerPermissionMiddleware)([permissions_1.BaseRolePermissions.MANAGE_EXPRESSION]), serverEmojiCtrl.updateServerEmoji);
serverRouter.delete("/:emojiId", (0, checkServerPermissionMiddleware_1.checkServerPermissionMiddleware)([permissions_1.BaseRolePermissions.MANAGE_EXPRESSION]), serverEmojiCtrl.deleteServerEmoji);
exports.default = serverRouter;
