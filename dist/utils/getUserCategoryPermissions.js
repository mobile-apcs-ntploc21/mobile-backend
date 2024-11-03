"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCategoryPermissionsFunc = void 0;
const graphql_1 = __importDefault(require("./graphql"));
const permissions_1 = require("../constants/permissions");
const getUserChannelPermissions_1 = require("./getUserChannelPermissions");
const getUserCategoryPermissionsFunc = async (userId, categoryId, serverId) => {
    let isAdmin = false;
    let isServerOwner = false;
    let combinedPermissions = {};
    const checkPermissionsQuery = (0, getUserChannelPermissions_1.createQuery)(undefined, categoryId);
    const response = await (0, graphql_1.default)().request(checkPermissionsQuery, {
        server_id: serverId,
        category_id: categoryId,
        channel_id: null,
        user_id: userId,
    });
    try {
        const { server } = response;
        if (server.owner === userId)
            isServerOwner = true;
    }
    catch (error) {
        throw new Error("Error fetching server details: " + error.message);
    }
    const { getRolesAssignedWithUser: roles } = response;
    const roleIds = roles.map((role) => role.id);
    let { categoryPermissions, userCategoryPermissions } = response;
    categoryPermissions =
        categoryPermissions?.getCategoryRolesPermissions.filter((perm) => roleIds.includes(perm.id)) ?? null;
    for (const role of roles) {
        isAdmin = isAdmin || role.is_admin;
        const parsedRolePermissions = JSON.parse(role.permissions);
        const categoryPerm = categoryPermissions?.find((perm) => perm.role_id === role.id);
        const parsedCategoryPerms = categoryPerm
            ? JSON.parse(categoryPerm.permissions)
            : {};
        const finalPermissions = {
            ...parsedRolePermissions,
            ...parsedCategoryPerms,
        };
        for (const key in finalPermissions) {
            if (finalPermissions[key] === "ALLOWED") {
                combinedPermissions[key] = "ALLOWED";
            }
            else {
                if (!combinedPermissions[key]) {
                    combinedPermissions[key] = "DENIED";
                }
            }
        }
    }
    const parsedUserCategoryPerms = userCategoryPermissions
        ? JSON.parse(userCategoryPermissions.permissions)
        : {};
    const userFinalPermissions = {
        ...parsedUserCategoryPerms,
    };
    for (const key in userFinalPermissions) {
        if (userFinalPermissions[key] !== "DEFAULT") {
            combinedPermissions[key] = userFinalPermissions[key];
        }
    }
    const finalFilteredPermissions = {};
    for (const key in permissions_1.CategoryPermissions) {
        if (combinedPermissions.hasOwnProperty(key)) {
            finalFilteredPermissions[key] =
                isServerOwner || isAdmin ? "ALLOWED" : combinedPermissions[key];
        }
    }
    return finalFilteredPermissions;
};
exports.getUserCategoryPermissionsFunc = getUserCategoryPermissionsFunc;
