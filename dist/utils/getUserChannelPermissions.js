"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserChannelPermissionsFunc = exports.createQuery = void 0;
const graphql_1 = __importDefault(require("./graphql"));
const permissions_1 = require("../constants/permissions");
const graphql_request_1 = require("graphql-request");
const createQuery = (channelId, categoryId) => {
    const channelPart = channelId
        ? `
    getChannelRolesPermissions(channel_id: $channel_id) {
      id
      permissions
    }
    getChannelUserPermission(user_id: $user_id, channel_id: $channel_id) {
      permissions
    }`
        : "";
    const categoryPart = categoryId
        ? `
    getCategoryRolesPermissions(category_id: $category_id) {
      id
      permissions
    }
    getCategoryUserPermission(user_id: $user_id, category_id: $category_id) {
      permissions
    }`
        : "";
    const query = (0, graphql_request_1.gql) `
    query checkPermissions(
      $server_id: ID!,
      $user_id: ID!,
      ${channelId ? "$channel_id: ID!," : ""}
      ${categoryId ? "$category_id: ID!," : ""}
    ) {
      server(server_id: $server_id) {
        owner
      }
      getRolesAssignedWithUser(server_id: $server_id, user_id: $user_id) {
        id
        is_admin
        permissions
      }
      ${channelPart}
      ${categoryPart}
    }`;
    return query;
};
exports.createQuery = createQuery;
const getUserChannelPermissionsFunc = async (userId, channelId, serverId, extra) => {
    let isAdmin = false;
    let isServerOwner = false;
    let categoryId = extra?.channelObject?.category_id ?? null;
    let combinedPermissions = {};
    const checkPermissionsQuery = (0, exports.createQuery)(channelId, categoryId);
    const response = await (0, graphql_1.default)().request(checkPermissionsQuery, {
        server_id: serverId,
        category_id: categoryId,
        channel_id: channelId,
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
    let categoryPermissions = response?.getCategoryRolesPermissions;
    let channelPermissions = response?.getChannelRolesPermissions;
    let userCategoryPermissions = response?.getCategoryUserPermission;
    let userChannelPermissions = response?.getChannelUserPermission;
    categoryPermissions =
        categoryPermissions?.filter((perm) => roleIds.includes(perm.id)) ??
            null;
    channelPermissions =
        channelPermissions?.filter((perm) => roleIds.includes(perm.id)) ??
            null;
    for (const role of roles) {
        isAdmin = isAdmin || role.is_admin;
        const parsedRolePermissions = JSON.parse(role.permissions);
        const categoryPerm = categoryPermissions?.find((perm) => perm.role_id === role.id);
        const parsedCategoryPerms = categoryPerm
            ? JSON.parse(categoryPerm.permissions)
            : {};
        const channelPerm = channelPermissions?.find((perm) => perm.role_id === role.id);
        const parsedChannelPerms = channelPerm
            ? JSON.parse(channelPerm.permissions)
            : {};
        const finalPermissions = {
            ...parsedRolePermissions,
            ...parsedCategoryPerms,
            ...parsedChannelPerms,
        };
        for (const key in finalPermissions) {
            if (finalPermissions[key] === "ALLOWED") {
                combinedPermissions[key] = "ALLOWED";
            }
            else if (!combinedPermissions[key]) {
                combinedPermissions[key] = "DENIED";
            }
        }
    }
    const parsedUserCategoryPerms = userCategoryPermissions
        ? JSON.parse(userCategoryPermissions?.permissions)
        : {};
    const parsedUserChannelPerms = userChannelPermissions
        ? JSON.parse(userChannelPermissions?.permissions)
        : {};
    const userFinalPermissions = {
        ...parsedUserCategoryPerms,
        ...parsedUserChannelPerms,
    };
    for (const key in userFinalPermissions) {
        if (userFinalPermissions[key] !== "DEFAULT") {
            combinedPermissions[key] = userFinalPermissions[key];
        }
    }
    const finalFilteredPermissions = {};
    for (const key in permissions_1.ChannelPermissions) {
        if (combinedPermissions.hasOwnProperty(key)) {
            finalFilteredPermissions[key] =
                isServerOwner || isAdmin ? "ALLOWED" : combinedPermissions[key];
        }
    }
    return finalFilteredPermissions;
};
exports.getUserChannelPermissionsFunc = getUserChannelPermissionsFunc;
