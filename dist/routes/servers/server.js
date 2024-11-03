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
const permissions_1 = require("../../constants/permissions");
const serverCtrl = __importStar(require("../../controllers/servers/server"));
const server_member_1 = require("../../controllers/servers/server_member");
const server_permission_1 = require("../../controllers/servers/server_permission");
const message_1 = require("../../controllers/servers/message");
const authMiddleware_1 = require("../../utils/authMiddleware");
const checkMembershipMiddleware_1 = require("../../utils/checkMembershipMiddleware");
const checkOwnerMiddleware_1 = require("../../utils/checkOwnerMiddleware");
const checkServerPermissionMiddleware_1 = require("../../utils/checkServerPermissionMiddleware");
const category_1 = __importDefault(require("./channels/category"));
const channel_1 = __importDefault(require("./channels/channel"));
const server_owner_1 = __importDefault(require("./server_owner"));
const server_permission_2 = __importDefault(require("./server_permission"));
const serverRouter = (0, express_1.Router)();
serverRouter.use("/:serverId/owner", checkOwnerMiddleware_1.checkOwnerMiddleware, server_owner_1.default);
serverRouter.post("/join", authMiddleware_1.authMiddleware, server_member_1.joinServer);
serverRouter.get("/:serverId/members", authMiddleware_1.authMiddleware, checkMembershipMiddleware_1.checkMembershipMiddleware, server_member_1.getServerMembers);
serverRouter.delete("/:serverId/left", authMiddleware_1.authMiddleware, checkMembershipMiddleware_1.checkMembershipMiddleware, server_member_1.removeSelf);
serverRouter.get("/list/", authMiddleware_1.authMiddleware, serverCtrl.getUserServers);
serverRouter.get("/:serverId", serverCtrl.getServer);
serverRouter.put("/move", authMiddleware_1.authMiddleware, serverCtrl.moveServer);
serverRouter.patch("/:serverId/favorite", authMiddleware_1.authMiddleware, serverCtrl.setFavoriteServer);
serverRouter.post("/", authMiddleware_1.authMiddleware, serverCtrl.createServer);
serverRouter.put("/:serverId", authMiddleware_1.authMiddleware, checkMembershipMiddleware_1.checkMembershipMiddleware, (0, checkServerPermissionMiddleware_1.checkServerPermissionMiddleware)([permissions_1.BaseRolePermissions.MANAGE_SERVER]), serverCtrl.updateServer);
serverRouter.patch("/:serverId", authMiddleware_1.authMiddleware, checkMembershipMiddleware_1.checkMembershipMiddleware, (0, checkServerPermissionMiddleware_1.checkServerPermissionMiddleware)([permissions_1.BaseRolePermissions.MANAGE_SERVER]), serverCtrl.updateServer);
serverRouter.delete("/:serverId", authMiddleware_1.authMiddleware, checkMembershipMiddleware_1.checkMembershipMiddleware, serverCtrl.deleteServer);
serverRouter.get("/:serverId/invite", authMiddleware_1.authMiddleware, checkMembershipMiddleware_1.checkMembershipMiddleware, (0, checkServerPermissionMiddleware_1.checkServerPermissionMiddleware)([permissions_1.BaseRolePermissions.MANAGE_INVITE]), serverCtrl.getInviteCode);
serverRouter.post("/:serverId/invite", authMiddleware_1.authMiddleware, checkMembershipMiddleware_1.checkMembershipMiddleware, (0, checkServerPermissionMiddleware_1.checkServerPermissionMiddleware)([permissions_1.BaseRolePermissions.MANAGE_INVITE]), serverCtrl.createInviteCode);
serverRouter.delete("/:serverId/invite/", authMiddleware_1.authMiddleware, checkMembershipMiddleware_1.checkMembershipMiddleware, (0, checkServerPermissionMiddleware_1.checkServerPermissionMiddleware)([permissions_1.BaseRolePermissions.MANAGE_INVITE]), serverCtrl.deleteInviteCode);
serverRouter.post("/:serverId/transfer-ownership", authMiddleware_1.authMiddleware, serverCtrl.transferOwnership);
serverRouter.use("/:serverId/roles", authMiddleware_1.authMiddleware, checkMembershipMiddleware_1.checkMembershipMiddleware, server_permission_2.default);
serverRouter.get("/:serverId/members/self/roles", authMiddleware_1.authMiddleware, checkMembershipMiddleware_1.checkMembershipMiddleware, server_permission_1.getRolesAssignedWithMyself);
serverRouter.get("/:serverId/members/:userId/roles", authMiddleware_1.authMiddleware, checkMembershipMiddleware_1.checkMembershipMiddleware, server_permission_1.getRolesAssignedWithUser);
serverRouter.get("/:serverId/members/self/permissions", authMiddleware_1.authMiddleware, checkMembershipMiddleware_1.checkMembershipMiddleware, server_permission_1.getCurrentUserPermissions);
serverRouter.use("/:serverId/categories/", authMiddleware_1.authMiddleware, checkMembershipMiddleware_1.checkMembershipMiddleware, category_1.default);
serverRouter.use("/:serverId/channels/", authMiddleware_1.authMiddleware, checkMembershipMiddleware_1.checkMembershipMiddleware, channel_1.default);
serverRouter.get("/:serverId/messages/search", authMiddleware_1.authMiddleware, checkMembershipMiddleware_1.checkMembershipMiddleware, message_1.searchMessages);
serverRouter.get("/:serverId/messages/:messageId", authMiddleware_1.authMiddleware, checkMembershipMiddleware_1.checkMembershipMiddleware, message_1.getMessage);
exports.default = serverRouter;
