"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const channel_permission_1 = require("../../../controllers/servers/channels/channel_permission");
const express_1 = require("express");
const checkServerAdminMiddleware_1 = require("../../../utils/checkServerAdminMiddleware");
const channelPermissionRouter = (0, express_1.Router)({ mergeParams: true });
channelPermissionRouter.get("/roles/permissions", checkServerAdminMiddleware_1.checkServerAdminMiddleware, channel_permission_1.getRolesAssignedWithChannel);
channelPermissionRouter.get("/users/self/permissions", channel_permission_1.getUserChannelPermissions);
channelPermissionRouter.get("/users/permissions", checkServerAdminMiddleware_1.checkServerAdminMiddleware, channel_permission_1.getUsersAssignedWithChannelPermission);
channelPermissionRouter.get("/roles/:roleId/permissions", checkServerAdminMiddleware_1.checkServerAdminMiddleware, channel_permission_1.getRoleAssignedWithChannel);
channelPermissionRouter.get("/users/:userId/permissions", checkServerAdminMiddleware_1.checkServerAdminMiddleware, channel_permission_1.getUserAssignedWithChannelPermission);
channelPermissionRouter.post("/roles/:roleId/permissions", checkServerAdminMiddleware_1.checkServerAdminMiddleware, channel_permission_1.addRoleToChannelPermission);
channelPermissionRouter.post("/users/:userId/permissions", checkServerAdminMiddleware_1.checkServerAdminMiddleware, channel_permission_1.addUserToChannelPermission);
channelPermissionRouter.put("/roles/:roleId/permissions", checkServerAdminMiddleware_1.checkServerAdminMiddleware, channel_permission_1.updateRoleChannelPermission);
channelPermissionRouter.put("/users/:userId/permissions", checkServerAdminMiddleware_1.checkServerAdminMiddleware, channel_permission_1.updateUserChannelPermission);
channelPermissionRouter.patch("/roles/:roleId/permissions", checkServerAdminMiddleware_1.checkServerAdminMiddleware, channel_permission_1.updatePartialRoleChannelPermission);
channelPermissionRouter.patch("/users/:userId/permissions", checkServerAdminMiddleware_1.checkServerAdminMiddleware, channel_permission_1.updatePartialUserChannelPermission);
channelPermissionRouter.delete("/roles/:roleId/permissions", checkServerAdminMiddleware_1.checkServerAdminMiddleware, channel_permission_1.deleteRoleChannelPermission);
channelPermissionRouter.delete("/users/:userId/permissions", checkServerAdminMiddleware_1.checkServerAdminMiddleware, channel_permission_1.deleteUserChannelPermission);
exports.default = channelPermissionRouter;
