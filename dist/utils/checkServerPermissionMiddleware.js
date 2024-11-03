"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkServerPermissionMiddleware = void 0;
const graphql_1 = __importDefault(require("../utils/graphql"));
const getUserChannelPermissions_1 = require("./getUserChannelPermissions");
const log_1 = require("@/utils/log");
const checkServerPermissionMiddleware = (requiredPermissions) => {
    return async (req, res, next) => {
        const { uid, server_id } = res.locals;
        if (!server_id) {
            res
                .status(400)
                .json({ status: "fail", message: "Server ID is required." });
            return;
        }
        const checkPermissionsQuery = (0, getUserChannelPermissions_1.createQuery)();
        const response = await (0, graphql_1.default)().request(checkPermissionsQuery, {
            server_id: server_id,
            category_id: null,
            channel_id: null,
            user_id: uid,
        });
        try {
            const { server: { owner }, } = response;
            if (owner === uid) {
                next();
                return;
            }
            const { getRolesAssignedWithUser: roles } = response;
            const isAdmin = roles.some((role) => role.is_admin);
            if (isAdmin) {
                next();
                return;
            }
            const finalPermissions = roles.reduce((acc, role) => {
                let role_permissions;
                try {
                    role_permissions = JSON.parse(role.permissions);
                }
                catch (e) {
                    log_1.log.error("Invalid JSON in role.permissions:", role.permissions);
                    return acc;
                }
                if (typeof role_permissions !== "object" || role_permissions === null) {
                    log_1.log.error("role.permissions is not an object:", role_permissions);
                    return acc;
                }
                for (const permission in role_permissions) {
                    if (role_permissions.hasOwnProperty(permission)) {
                        if (role_permissions[permission] !== "DENIED") {
                            acc[permission] = role_permissions[permission];
                        }
                    }
                }
                return acc;
            }, {});
            const hasAllPermissions = requiredPermissions.every((permission) => finalPermissions[permission] === "ALLOWED");
            if (!hasAllPermissions) {
                res.status(403).json({
                    status: "fail",
                    message: "You are not authorized to make this request",
                });
                return;
            }
            res.locals.userServerPermissions = finalPermissions;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.checkServerPermissionMiddleware = checkServerPermissionMiddleware;
