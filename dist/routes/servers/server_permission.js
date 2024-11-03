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
const serverRoles = __importStar(require("../../controllers/servers/server_permission"));
const checkServerAdminMiddleware_1 = require("../../utils/checkServerAdminMiddleware");
const serverRoleRouter = (0, express_1.Router)();
serverRoleRouter.get("/", serverRoles.getServerRoles);
serverRoleRouter.post("/", checkServerAdminMiddleware_1.checkServerAdminMiddleware, serverRoles.createServerRole);
serverRoleRouter.get("/default", serverRoles.getDefaultServerRole);
serverRoleRouter.patch("/default", checkServerAdminMiddleware_1.checkServerAdminMiddleware, serverRoles.updateDefaultServerRole);
serverRoleRouter.get("/default/permissions", checkServerAdminMiddleware_1.checkServerAdminMiddleware, serverRoles.getDefaultServerRolePermissions);
serverRoleRouter.put("/default/permissions", checkServerAdminMiddleware_1.checkServerAdminMiddleware, serverRoles.updateDefaultServerRolePermissions);
serverRoleRouter.patch("/default/permissions", checkServerAdminMiddleware_1.checkServerAdminMiddleware, serverRoles.updatePartialDefaultServerRolePermissions);
serverRoleRouter.get("/:roleId", serverRoles.getServerRole);
serverRoleRouter.delete("/:roleId", checkServerAdminMiddleware_1.checkServerAdminMiddleware, serverRoles.deleteServerRole);
serverRoleRouter.patch("/:roleId", checkServerAdminMiddleware_1.checkServerAdminMiddleware, serverRoles.updateServerRole);
serverRoleRouter.get("/:roleId/permissions", checkServerAdminMiddleware_1.checkServerAdminMiddleware, serverRoles.getServerRolePermissions);
serverRoleRouter.put("/:roleId/permissions", checkServerAdminMiddleware_1.checkServerAdminMiddleware, serverRoles.updateServerRolePermissions);
serverRoleRouter.patch("/:roleId/permissions", checkServerAdminMiddleware_1.checkServerAdminMiddleware, serverRoles.updatePartialServerRolePermissions);
serverRoleRouter.get("/:roleId/members", serverRoles.getServerRoleMembers);
serverRoleRouter.post("/:roleId/members/self", checkServerAdminMiddleware_1.checkServerAdminMiddleware, serverRoles.addMyselfToRole);
serverRoleRouter.delete("/:roleId/members/self", serverRoles.removeMyselfFromRole);
serverRoleRouter.post("/:roleId/members/:userId", checkServerAdminMiddleware_1.checkServerAdminMiddleware, serverRoles.addMemberToRole);
serverRoleRouter.delete("/:roleId/members/:userId", checkServerAdminMiddleware_1.checkServerAdminMiddleware, serverRoles.removeMemberFromRole);
exports.default = serverRoleRouter;
