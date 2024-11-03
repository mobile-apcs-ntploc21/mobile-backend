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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const channel_permission_1 = __importDefault(require("./channel_permission"));
const messages_1 = __importDefault(require("./messages"));
const checkChannelExistenceMiddleware_1 = require("../../../utils/checkChannelExistenceMiddleware");
const checkChannelPermissionMiddleware_1 = require("../../../utils/checkChannelPermissionMiddleware");
const permissions_1 = require("../../../constants/permissions");
const channelCtrl = __importStar(require("../../../controllers/servers/channels/channel"));
const channelRouter = (0, express_1.Router)({ mergeParams: true });
channelRouter.patch("/move", (0, checkChannelPermissionMiddleware_1.checkChannelPermissionMiddleware)([permissions_1.ChannelPermissions.MANAGE_CHANNEL]), channelCtrl.moveAllChannel);
channelRouter.get("/", channelCtrl.getChannels);
channelRouter.get("/:channelId", checkChannelExistenceMiddleware_1.checkChannelExistenceMiddleware, (0, checkChannelPermissionMiddleware_1.checkChannelPermissionMiddleware)([permissions_1.ChannelPermissions.VIEW_CHANNEL]), channelCtrl.getChannel);
channelRouter.post("/", (0, checkChannelPermissionMiddleware_1.checkChannelPermissionMiddleware)([permissions_1.ChannelPermissions.MANAGE_CHANNEL]), channelCtrl.createChannel);
channelRouter.patch("/:channelId", checkChannelExistenceMiddleware_1.checkChannelExistenceMiddleware, (0, checkChannelPermissionMiddleware_1.checkChannelPermissionMiddleware)([permissions_1.ChannelPermissions.MANAGE_CHANNEL]), channelCtrl.updateChannel);
channelRouter.delete("/:channelId", checkChannelExistenceMiddleware_1.checkChannelExistenceMiddleware, (0, checkChannelPermissionMiddleware_1.checkChannelPermissionMiddleware)([permissions_1.ChannelPermissions.MANAGE_CHANNEL]), channelCtrl.deleteChannel);
channelRouter.patch("/:channelId/move", checkChannelExistenceMiddleware_1.checkChannelExistenceMiddleware, (0, checkChannelPermissionMiddleware_1.checkChannelPermissionMiddleware)([permissions_1.ChannelPermissions.MANAGE_CHANNEL]), channelCtrl.moveChannel);
channelRouter.use("/:channelId/", checkChannelExistenceMiddleware_1.checkChannelExistenceMiddleware, channel_permission_1.default);
channelRouter.use("/:channelId/messages", checkChannelExistenceMiddleware_1.checkChannelExistenceMiddleware, (0, checkChannelPermissionMiddleware_1.checkChannelPermissionMiddleware)([permissions_1.ChannelPermissions.VIEW_CHANNEL]), messages_1.default);
exports.default = channelRouter;
