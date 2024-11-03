"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCategoryPermissionMiddleware = void 0;
const getUserCategoryPermissions_1 = require("../utils/getUserCategoryPermissions");
const checkCategoryPermissionMiddleware = (requiredPermissions) => {
    return async (_req, res, next) => {
        const { uid: user_id, server_id, category_id } = res.locals;
        if (!user_id || !server_id) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        let currentUserPermissions = null;
        if (category_id && res.locals?.userCategoryId === category_id) {
            currentUserPermissions = res.locals.userCategoryPermissions;
        }
        else {
            currentUserPermissions = await (0, getUserCategoryPermissions_1.getUserCategoryPermissionsFunc)(user_id, category_id, server_id);
        }
        const hasPermission = requiredPermissions.every((permission) => {
            return currentUserPermissions[permission] === "ALLOWED";
        });
        if (!hasPermission) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }
        res.locals.userCategoryId = category_id;
        res.locals.userCategoryPermissions = currentUserPermissions;
        next();
    };
};
exports.checkCategoryPermissionMiddleware = checkCategoryPermissionMiddleware;
