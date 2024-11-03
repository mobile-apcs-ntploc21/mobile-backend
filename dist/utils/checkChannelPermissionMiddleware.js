"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkChannelPermissionMiddleware = void 0;
const getUserChannelPermissions_1 = require("../utils/getUserChannelPermissions");
const checkChannelPermissionMiddleware = (requiredPermissions) => {
    return async (req, res, next) => {
        const { uid: user_id, server_id, channel_id } = res.locals;
        if (!user_id || !server_id) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        let currentUserPermissions = null;
        if (channel_id && res.locals?.userChannelId === channel_id) {
            currentUserPermissions = res.locals.userChannelPermissions;
        }
        else {
            currentUserPermissions = await (0, getUserChannelPermissions_1.getUserChannelPermissionsFunc)(user_id, channel_id, server_id, { channelObject: res.locals.channelObject });
        }
        const hasPermission = requiredPermissions.every((permission) => {
            return currentUserPermissions[permission] === "ALLOWED";
        });
        if (!hasPermission) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }
        res.locals.userChannelId = channel_id;
        res.locals.userChannelPermissions = currentUserPermissions;
        next();
    };
};
exports.checkChannelPermissionMiddleware = checkChannelPermissionMiddleware;
