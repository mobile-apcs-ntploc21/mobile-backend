"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserChannelPermissions = exports.deleteUserChannelPermission = exports.deleteRoleChannelPermission = exports.updatePartialUserChannelPermission = exports.updateUserChannelPermission = exports.updatePartialRoleChannelPermission = exports.updateRoleChannelPermission = exports.addUserToChannelPermission = exports.addRoleToChannelPermission = exports.getUserAssignedWithChannelPermission = exports.getRoleAssignedWithChannel = exports.getUsersAssignedWithChannelPermission = exports.getRolesAssignedWithChannel = void 0;
const graphql_1 = __importDefault(require("@/utils/graphql"));
const queries_1 = require("@/graphql/queries");
const mutations_1 = require("@/graphql/mutations");
const getUserChannelPermissions_1 = require("@/utils/getUserChannelPermissions");
const log_1 = require("@/utils/log");
const getRolesAssignedWithChannel = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const channelId = res.locals.channel_id;
    log_1.log.debug(channelId);
    try {
        const { getChannelRolesPermissions: roles } = await (0, graphql_1.default)().request(queries_1.serverChannelPermissionQueries.GET_CHANNEL_ROLES_PERMISSION, {
            channel_id: channelId,
        });
        if (!roles.length) {
            res.json({
                server_id: serverId,
                channel_id: channelId,
                roles: [],
            });
            return;
        }
        res.json({
            server_id: serverId,
            channel_id: channelId,
            roles: roles.map((role) => ({
                id: role.id,
                name: role.name,
                color: role.color,
                position: role.position,
                is_admin: role.is_admin,
                allow_anyone_mention: role.allow_anyone_mention,
                last_modified: role.last_modified,
                number_of_users: role.number_of_users,
            })),
        });
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.getRolesAssignedWithChannel = getRolesAssignedWithChannel;
const getUsersAssignedWithChannelPermission = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const channelId = res.locals.channel_id;
    try {
        const { getChannelUsersPermissions: users } = await (0, graphql_1.default)().request(queries_1.serverChannelPermissionQueries.GET_CHANNEL_USERS_PERMISSION, {
            channel_id: channelId,
        });
        if (!users.length) {
            res.json({
                server_id: serverId,
                channel_id: channelId,
                users: [],
            });
            return;
        }
        res.json({
            server_id: serverId,
            channel_id: channelId,
            users: users.map((user) => ({
                id: user.id,
                username: user.username,
                display_name: user.display_name,
                avatar_url: user.avatar_url,
                banner_url: user.banner_url,
                about_me: user.about_me,
            })),
        });
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.getUsersAssignedWithChannelPermission = getUsersAssignedWithChannelPermission;
const getRoleAssignedWithChannel = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const channelId = res.locals.channel_id;
    const roleId = req.params.roleId;
    try {
        const { getChannelRolePermission: role } = await (0, graphql_1.default)().request(queries_1.serverChannelPermissionQueries.GET_CHANNEL_ROLE_PERMISSION, {
            role_id: roleId,
            channel_id: channelId,
        });
        let parsedRolePermissions = null;
        try {
            parsedRolePermissions = JSON.parse(role.permissions);
        }
        catch (error) {
            res
                .status(400)
                .json({ message: "Channel role permissions is not in JSON format !" });
            return;
        }
        res.status(200).json({
            ...parsedRolePermissions,
        });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.getRoleAssignedWithChannel = getRoleAssignedWithChannel;
const getUserAssignedWithChannelPermission = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const channelId = res.locals.channel_id;
    const userId = req.params.userId;
    try {
        const { getChannelUserPermission: user } = await (0, graphql_1.default)().request(queries_1.serverChannelPermissionQueries.GET_CHANNEL_USER_PERMISSION, {
            user_id: userId,
            channel_id: channelId,
        });
        log_1.log.debug(user);
        let parsedUserPermissions = null;
        try {
            parsedUserPermissions = JSON.parse(user.permissions);
        }
        catch (error) {
            res
                .status(400)
                .json({ message: "User permissions is not in JSON format !" });
            return;
        }
        res.status(200).json({
            ...parsedUserPermissions,
        });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.getUserAssignedWithChannelPermission = getUserAssignedWithChannelPermission;
const addRoleToChannelPermission = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const channelId = res.locals.channel_id;
    const roleId = req.params.roleId;
    const updatedFields = req.body;
    try {
        const { getDefaultServerRole: role } = await (0, graphql_1.default)().request(queries_1.serverRoleQueries.GET_DEFAULT_SERVER_ROLE, {
            server_id: serverId,
        });
        const { getChannelRolePermission: channel } = await (0, graphql_1.default)().request(queries_1.serverChannelPermissionQueries.GET_CHANNEL_ROLE_PERMISSION, {
            role_id: role.id,
            channel_id: channelId,
        });
        let parsedChannelRolePermissions = null;
        try {
            parsedChannelRolePermissions = JSON.parse(channel.permissions);
        }
        catch (error) {
            res
                .status(400)
                .json({ message: "Channel role permissions is not in JSON format !" });
            return;
        }
        for (const key in updatedFields) {
            if (updatedFields.hasOwnProperty(key)) {
                const value = updatedFields[key];
                if (!parsedChannelRolePermissions.hasOwnProperty(key)) {
                    res.status(400).json({
                        message: `Invalid permission: ${key}. Permission invalid.`,
                    });
                    return;
                }
                if (value !== "ALLOWED" && value !== "DENIED" && value !== "DEFAULT") {
                    res.status(400).json({
                        message: `Invalid value for ${key}: ${value}. Must be "ALLOWED" or "DENIED" or "DEFAULT".`,
                    });
                    return;
                }
            }
        }
        for (const key in updatedFields) {
            if (updatedFields.hasOwnProperty(key)) {
                parsedChannelRolePermissions[key] = updatedFields[key];
            }
        }
        const { createChannelRolePermission: roles } = await (0, graphql_1.default)().request(mutations_1.serverChannelPermissionMutations.CREATE_CHANNEL_ROLE_PERMISSION, {
            role_id: roleId,
            channel_id: channelId,
            permissions: JSON.stringify(parsedChannelRolePermissions),
        });
        const filteredRoles = roles.map((role) => ({
            id: role.id,
            name: role.name,
            color: role.color,
            position: role.position,
            is_admin: role.is_admin,
            default: role.default,
            allow_anyone_mention: role.allow_anyone_mention,
            last_modified: role.last_modified,
            number_of_users: role.number_of_users,
        }));
        res.json({
            server_id: serverId,
            channel_id: channelId,
            roles: filteredRoles ? filteredRoles : [],
        });
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.addRoleToChannelPermission = addRoleToChannelPermission;
const addUserToChannelPermission = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const channelId = res.locals.channel_id;
    const userId = req.params.userId;
    const updatedFields = req.body;
    try {
        const { getDefaultServerRole: role } = await (0, graphql_1.default)().request(queries_1.serverRoleQueries.GET_DEFAULT_SERVER_ROLE, {
            server_id: serverId,
        });
        const { getChannelRolePermission: channel } = await (0, graphql_1.default)().request(queries_1.serverChannelPermissionQueries.GET_CHANNEL_ROLE_PERMISSION, {
            role_id: role.id,
            channel_id: channelId,
        });
        let parsedChannelRolePermissions = null;
        try {
            parsedChannelRolePermissions = JSON.parse(channel.permissions);
        }
        catch (error) {
            res
                .status(400)
                .json({ message: "Channel role permissions is not in JSON format !" });
            return;
        }
        for (const key in updatedFields) {
            if (updatedFields.hasOwnProperty(key)) {
                const value = updatedFields[key];
                if (!parsedChannelRolePermissions.hasOwnProperty(key)) {
                    res.status(400).json({
                        message: `Invalid permission: ${key}. Permission invalid.`,
                    });
                    return;
                }
                if (value !== "ALLOWED" && value !== "DENIED" && value !== "DEFAULT") {
                    res.status(400).json({
                        message: `Invalid value for ${key}: ${value}. Must be "ALLOWED" or "DENIED" or "DEFAULT".`,
                    });
                    return;
                }
            }
        }
        for (const key in updatedFields) {
            if (updatedFields.hasOwnProperty(key)) {
                parsedChannelRolePermissions[key] = updatedFields[key];
            }
        }
        const { createChannelUserPermission: users } = await (0, graphql_1.default)().request(mutations_1.serverChannelPermissionMutations.CREATE_CHANNEL_USER_PERMISSION, {
            user_id: userId,
            channel_id: channelId,
            permissions: JSON.stringify(parsedChannelRolePermissions),
        });
        const filteredUsers = users.map((user) => ({
            id: user.id,
            username: user.username,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            banner_url: user.banner_url,
            about_me: user.about_me,
        }));
        res.json({
            server_id: serverId,
            channel_id: channelId,
            users: filteredUsers ? filteredUsers : [],
        });
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.addUserToChannelPermission = addUserToChannelPermission;
const updateRoleChannelPermission = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const channelId = res.locals.channel_id;
    const roleId = req.params.roleId;
    const updatedFields = req.body;
    try {
        const { getChannelRolePermission: role } = await (0, graphql_1.default)().request(queries_1.serverChannelPermissionQueries.GET_CHANNEL_ROLE_PERMISSION, {
            role_id: roleId,
            channel_id: channelId,
        });
        let parsedRolePermissions = null;
        try {
            parsedRolePermissions = JSON.parse(role.permissions);
        }
        catch (error) {
            res
                .status(400)
                .json({ message: "Channel role permissions is not in JSON format !" });
            return;
        }
        for (const key in updatedFields) {
            if (updatedFields.hasOwnProperty(key)) {
                const value = updatedFields[key];
                if (!parsedRolePermissions.hasOwnProperty(key)) {
                    res.status(400).json({
                        message: `Invalid permission: ${key}. Permission invalid.`,
                    });
                    return;
                }
                if (value !== "ALLOWED" && value !== "DENIED" && value !== "DEFAULT") {
                    res.status(400).json({
                        message: `Invalid value for ${key}: ${value}. Must be "ALLOWED" or "DENIED" or "DEFAULT".`,
                    });
                    return;
                }
            }
        }
        for (const key in parsedRolePermissions) {
            if (!updatedFields.hasOwnProperty(key)) {
                res.status(400).json({
                    message: `Missing permission: ${key}. All permissions must be provided.`,
                });
                return;
            }
        }
        for (const key in updatedFields) {
            if (updatedFields.hasOwnProperty(key)) {
                parsedRolePermissions[key] = updatedFields[key];
            }
        }
        const { updateChannelRolePermission: roles } = await (0, graphql_1.default)().request(mutations_1.serverChannelPermissionMutations.UPDATE_CHANNEL_ROLE_PERMISSION, {
            role_id: roleId,
            channel_id: channelId,
            permissions: JSON.stringify(parsedRolePermissions),
        });
        try {
            parsedRolePermissions = JSON.parse(roles.permissions);
        }
        catch (error) {
            res.status(400).json({
                message: "Updated channel role permissions is not in JSON format !",
            });
            return;
        }
        res.status(200).json({
            ...parsedRolePermissions,
        });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.updateRoleChannelPermission = updateRoleChannelPermission;
const updatePartialRoleChannelPermission = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const channelId = res.locals.channel_id;
    const roleId = req.params.roleId;
    const updatedFields = req.body;
    try {
        const { getChannelRolePermission: role } = await (0, graphql_1.default)().request(queries_1.serverChannelPermissionQueries.GET_CHANNEL_ROLE_PERMISSION, {
            role_id: roleId,
            channel_id: channelId,
        });
        let parsedRolePermissions = null;
        try {
            parsedRolePermissions = JSON.parse(role.permissions);
        }
        catch (error) {
            res
                .status(400)
                .json({ message: "Channel role permissions is not in JSON format !" });
            return;
        }
        for (const key in updatedFields) {
            if (updatedFields.hasOwnProperty(key)) {
                const value = updatedFields[key];
                if (!parsedRolePermissions.hasOwnProperty(key)) {
                    res.status(400).json({
                        message: `Invalid permission: ${key}. Permission invalid.`,
                    });
                    return;
                }
                if (value !== "ALLOWED" && value !== "DENIED" && value !== "DEFAULT") {
                    res.status(400).json({
                        message: `Invalid value for ${key}: ${value}. Must be "ALLOWED" or "DENIED" or "DEFAULT".`,
                    });
                    return;
                }
            }
        }
        for (const key in updatedFields) {
            if (updatedFields.hasOwnProperty(key)) {
                parsedRolePermissions[key] = updatedFields[key];
            }
        }
        const { updateChannelRolePermission: roles } = await (0, graphql_1.default)().request(mutations_1.serverChannelPermissionMutations.UPDATE_CHANNEL_ROLE_PERMISSION, {
            role_id: roleId,
            channel_id: channelId,
            permissions: JSON.stringify(parsedRolePermissions),
        });
        try {
            parsedRolePermissions = JSON.parse(roles.permissions);
        }
        catch (error) {
            res.status(400).json({
                message: "Updated channel role permissions is not in JSON format !",
            });
            return;
        }
        res.status(200).json({
            ...parsedRolePermissions,
        });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.updatePartialRoleChannelPermission = updatePartialRoleChannelPermission;
const updateUserChannelPermission = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const channelId = res.locals.channel_id;
    const userId = req.params.userId;
    const updatedFields = req.body;
    try {
        const { getChannelUserPermission: user } = await (0, graphql_1.default)().request(queries_1.serverChannelPermissionQueries.GET_CHANNEL_USER_PERMISSION, {
            user_id: userId,
            channel_id: channelId,
        });
        let parsedUserPermissions = null;
        try {
            parsedUserPermissions = JSON.parse(user.permissions);
        }
        catch (error) {
            res
                .status(400)
                .json({ message: "User permissions is not in JSON format !" });
            return;
        }
        for (const key in updatedFields) {
            if (updatedFields.hasOwnProperty(key)) {
                const value = updatedFields[key];
                if (!parsedUserPermissions.hasOwnProperty(key)) {
                    res.status(400).json({
                        message: `Invalid permission: ${key}. Permission invalid.`,
                    });
                    return;
                }
                if (value !== "ALLOWED" && value !== "DENIED" && value !== "DEFAULT") {
                    res.status(400).json({
                        message: `Invalid value for ${key}: ${value}. Must be "ALLOWED" or "DENIED" or "DEFAULT".`,
                    });
                    return;
                }
            }
        }
        for (const key in parsedUserPermissions) {
            if (!updatedFields.hasOwnProperty(key)) {
                res.status(400).json({
                    message: `Missing permission: ${key}. All permissions must be provided.`,
                });
                return;
            }
        }
        for (const key in updatedFields) {
            if (updatedFields.hasOwnProperty(key)) {
                parsedUserPermissions[key] = updatedFields[key];
            }
        }
        const { updateChannelUserPermission: users } = await (0, graphql_1.default)().request(mutations_1.serverChannelPermissionMutations.UPDATE_CHANNEL_USER_PERMISSION, {
            user_id: userId,
            channel_id: channelId,
            permissions: JSON.stringify(parsedUserPermissions),
        });
        try {
            parsedUserPermissions = JSON.parse(users.permissions);
        }
        catch (error) {
            res
                .status(400)
                .json({ message: "Updated user permissions is not in JSON format !" });
            return;
        }
        res.status(200).json({
            ...parsedUserPermissions,
        });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.updateUserChannelPermission = updateUserChannelPermission;
const updatePartialUserChannelPermission = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const channelId = res.locals.channel_id;
    const userId = req.params.userId;
    const updatedFields = req.body;
    try {
        const { getChannelUserPermission: user } = await (0, graphql_1.default)().request(queries_1.serverChannelPermissionQueries.GET_CHANNEL_USER_PERMISSION, {
            user_id: userId,
            channel_id: channelId,
        });
        let parsedUserPermissions = null;
        try {
            parsedUserPermissions = JSON.parse(user.permissions);
        }
        catch (error) {
            res
                .status(400)
                .json({ message: "User permissions is not in JSON format !" });
            return;
        }
        for (const key in updatedFields) {
            if (updatedFields.hasOwnProperty(key)) {
                const value = updatedFields[key];
                if (!parsedUserPermissions.hasOwnProperty(key)) {
                    res.status(400).json({
                        message: `Invalid permission: ${key}. Permission invalid.`,
                    });
                    return;
                }
                if (value !== "ALLOWED" && value !== "DENIED" && value !== "DEFAULT") {
                    res.status(400).json({
                        message: `Invalid value for ${key}: ${value}. Must be "ALLOWED" or "DENIED" or "DEFAULT".`,
                    });
                    return;
                }
            }
        }
        for (const key in updatedFields) {
            if (updatedFields.hasOwnProperty(key)) {
                parsedUserPermissions[key] = updatedFields[key];
            }
        }
        const { updateChannelUserPermission: users } = await (0, graphql_1.default)().request(mutations_1.serverChannelPermissionMutations.UPDATE_CHANNEL_USER_PERMISSION, {
            user_id: userId,
            channel_id: channelId,
            permissions: JSON.stringify(parsedUserPermissions),
        });
        try {
            parsedUserPermissions = JSON.parse(users.permissions);
        }
        catch (error) {
            res
                .status(400)
                .json({ message: "Updated user permissions is not in JSON format !" });
            return;
        }
        res.status(200).json({
            ...parsedUserPermissions,
        });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.updatePartialUserChannelPermission = updatePartialUserChannelPermission;
const deleteRoleChannelPermission = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const channelId = res.locals.channel_id;
    const roleId = req.params.roleId;
    try {
        const { deleteChannelRolePermission: roles } = await (0, graphql_1.default)().request(mutations_1.serverChannelPermissionMutations.DELETE_CHANNEL_ROLE_PERMISSION, {
            role_id: roleId,
            channel_id: channelId,
        });
        const filteredRoles = roles.map((role) => ({
            id: role.id,
            name: role.name,
            color: role.color,
            position: role.position,
            is_admin: role.is_admin,
            default: role.default,
            allow_anyone_mention: role.allow_anyone_mention,
            last_modified: role.last_modified,
            number_of_users: role.number_of_users,
        }));
        res.json({
            server_id: serverId,
            channel_id: channelId,
            roles: filteredRoles ? filteredRoles : [],
        });
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.deleteRoleChannelPermission = deleteRoleChannelPermission;
const deleteUserChannelPermission = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const channelId = res.locals.channel_id;
    const userId = req.params.userId;
    try {
        const { deleteChannelUserPermission: users } = await (0, graphql_1.default)().request(mutations_1.serverChannelPermissionMutations.DELETE_CHANNEL_USER_PERMISSION, {
            user_id: userId,
            channel_id: channelId,
        });
        const filteredUsers = users.map((user) => ({
            id: user.id,
            username: user.username,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            banner_url: user.banner_url,
            about_me: user.about_me,
        }));
        res.json({
            server_id: serverId,
            channel_id: channelId,
            users: filteredUsers ? filteredUsers : [],
        });
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.deleteUserChannelPermission = deleteUserChannelPermission;
const getUserChannelPermissions = async (req, res, next) => {
    const userId = res.locals.uid;
    const channelId = res.locals.channel_id;
    const serverId = res.locals.server_id;
    log_1.log.debug(userId, channelId, serverId);
    try {
        const userChannelPermissions = await (0, getUserChannelPermissions_1.getUserChannelPermissionsFunc)(userId, channelId, serverId);
        res.json({
            server_id: serverId,
            user_id: userId,
            channel_id: channelId,
            permissions: userChannelPermissions,
        });
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.getUserChannelPermissions = getUserChannelPermissions;
