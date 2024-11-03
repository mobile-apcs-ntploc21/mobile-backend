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
const express_1 = __importDefault(require("express"));
const serverBansController = __importStar(require("../../controllers/servers/server_bans"));
const checkMembershipMiddleware_1 = require("../../utils/checkMembershipMiddleware");
const checkServerPermissionMiddleware_1 = require("../../utils/checkServerPermissionMiddleware");
const permissions_1 = require("../../constants/permissions");
const serverBansRouter = express_1.default.Router();
serverBansRouter.get("/:serverId/bans", checkMembershipMiddleware_1.checkMembershipMiddleware, (0, checkServerPermissionMiddleware_1.checkServerPermissionMiddleware)([permissions_1.BaseRolePermissions.BAN_MEMBER]), serverBansController.getServerBans);
serverBansRouter.get("/:serverId/bans/:userId", checkMembershipMiddleware_1.checkMembershipMiddleware, (0, checkServerPermissionMiddleware_1.checkServerPermissionMiddleware)([permissions_1.BaseRolePermissions.BAN_MEMBER]), serverBansController.getServerBan);
serverBansRouter.put("/:serverId/bans/:userId", checkMembershipMiddleware_1.checkMembershipMiddleware, (0, checkServerPermissionMiddleware_1.checkServerPermissionMiddleware)([permissions_1.BaseRolePermissions.BAN_MEMBER]), serverBansController.createServerBan);
serverBansRouter.post("/:serverId/bulk-ban", checkMembershipMiddleware_1.checkMembershipMiddleware, (0, checkServerPermissionMiddleware_1.checkServerPermissionMiddleware)([permissions_1.BaseRolePermissions.BAN_MEMBER]), serverBansController.createServerBulkBan);
serverBansRouter.delete("/:serverId/bans/:userId", checkMembershipMiddleware_1.checkMembershipMiddleware, (0, checkServerPermissionMiddleware_1.checkServerPermissionMiddleware)([permissions_1.BaseRolePermissions.BAN_MEMBER]), serverBansController.deleteServerBan);
serverBansRouter.put("/:serverId/kick/:userId", checkMembershipMiddleware_1.checkMembershipMiddleware, (0, checkServerPermissionMiddleware_1.checkServerPermissionMiddleware)([permissions_1.BaseRolePermissions.KICK_MEMBER]), serverBansController.createServerKick);
exports.default = serverBansRouter;
