"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUserPermissions = exports.getRolesAssignedWithMyself = exports.getRolesAssignedWithUser = exports.removeMyselfFromRole = exports.addMyselfToRole = exports.removeMemberFromRole = exports.addMemberToRole = exports.getServerRoleMembers = exports.updatePartialDefaultServerRolePermissions = exports.updateDefaultServerRolePermissions = exports.updatePartialServerRolePermissions = exports.updateServerRolePermissions = exports.getDefaultServerRolePermissions = exports.getServerRolePermissions = exports.updateDefaultServerRole = exports.updateServerRole = exports.deleteServerRole = exports.createServerRole = exports.getDefaultServerRole = exports.getServerRole = exports.getServerRoles = void 0;
const graphql_1 = __importDefault(require("../../utils/graphql"));
const queries_1 = require("../../graphql/queries");
const mutations_1 = require("../../graphql/mutations");
const log_1 = require("@/utils/log");
const getServerRoles = async (req, res, next) => {
    const serverId = res.locals.server_id;
    try {
        const { getServerRoles: roles } = await (0, graphql_1.default)().request(queries_1.serverRoleQueries.GET_SERVER_ROLES, {
            server_id: serverId,
        });
        if (!roles) {
            res.status(404).json({ message: "Server not found" });
            return;
        }
        if (roles.length === 0) {
            res.json({
                server_id: serverId,
                roles: [],
            });
            return;
        }
        res.json({
            server_id: serverId,
            roles: roles.map((role) => {
                return {
                    id: role.id,
                    name: role.name,
                    color: role.color,
                    position: role.position,
                    is_admin: role.is_admin,
                    default: role.default,
                    allow_anyone_mention: role.allow_anyone_mention,
                    last_modified: role.last_modified,
                    number_of_users: role.number_of_users,
                };
            }),
        });
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.getServerRoles = getServerRoles;
const getServerRole = async (req, res, next) => {
    const { roleId } = req.params;
    const serverId = res.locals.server_id;
    try {
        const { getServerRole: role } = await (0, graphql_1.default)().request(queries_1.serverRoleQueries.GET_SERVER_ROLE, {
            role_id: roleId,
        });
        res.json({
            id: role.id,
            server_id: role.server_id,
            name: role.name,
            color: role.color,
            position: role.position,
            is_admin: role.is_admin,
            default: role.default,
            allow_anyone_mention: role.allow_anyone_mention,
            last_modified: role.last_modified,
            number_of_users: role.number_of_users,
        });
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.getServerRole = getServerRole;
const getDefaultServerRole = async (req, res, next) => {
    const serverId = res.locals.server_id;
    try {
        const { getDefaultServerRole: defaultRole } = await (0, graphql_1.default)().request(queries_1.serverRoleQueries.GET_DEFAULT_SERVER_ROLE, {
            server_id: serverId,
        });
        res.json({
            id: defaultRole.id,
            server_id: defaultRole.server_id,
            name: defaultRole.name,
            color: defaultRole.color,
            position: defaultRole.position,
            is_admin: defaultRole.is_admin,
            default: defaultRole.default,
            allow_anyone_mention: defaultRole.allow_anyone_mention,
            last_modified: defaultRole.last_modified,
            number_of_users: defaultRole.number_of_users,
        });
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.getDefaultServerRole = getDefaultServerRole;
const createServerRole = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const { name, color, allow_anyone_mention, is_admin } = req.body;
    if (!name) {
        res.status(400).json({ message: "Name for the server role is required." });
        return;
    }
    try {
        const response = await (0, graphql_1.default)().request(mutations_1.serverRoleMutations.CREATE_SERVER_ROLE, {
            server_id: serverId,
            input: {
                name,
                color,
                allow_anyone_mention,
                is_admin,
            },
        });
        res.status(201).json({
            id: response.createServerRole.id,
            server_id: response.createServerRole.server_id,
            name: response.createServerRole.name,
            color: response.createServerRole.color,
            position: response.createServerRole.position,
            is_admin: response.createServerRole.is_admin,
            default: response.createServerRole.default,
            allow_anyone_mention: response.createServerRole.allow_anyone_mention,
            last_modified: response.createServerRole.last_modified,
            number_of_users: response.createServerRole.number_of_users,
        });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.createServerRole = createServerRole;
const deleteServerRole = async (req, res, next) => {
    const { roleId } = req.params;
    try {
        const response = await (0, graphql_1.default)().request(mutations_1.serverRoleMutations.DELETE_SERVER_ROLE, {
            role_id: roleId,
        });
        res.status(201).json({
            id: response.deleteServerRole.id,
            server_id: response.deleteServerRole.server_id,
            name: response.deleteServerRole.name,
            color: response.deleteServerRole.color,
            position: response.deleteServerRole.position,
            is_admin: response.deleteServerRole.is_admin,
            default: response.deleteServerRole.default,
            allow_anyone_mention: response.deleteServerRole.allow_anyone_mention,
            last_modified: response.deleteServerRole.last_modified,
            number_of_users: response.deleteServerRole.number_of_users,
        });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.deleteServerRole = deleteServerRole;
const updateServerRole = async (req, res, next) => {
    const { roleId } = req.params;
    const { name, color, allow_anyone_mention, is_admin } = req.body;
    try {
        const { getServerRole: currentRole } = await (0, graphql_1.default)().request(queries_1.serverRoleQueries.GET_SERVER_ROLE, {
            role_id: roleId,
        });
        if (!currentRole) {
            res.status(404).json({ message: "Server role not found" });
            return;
        }
        const { name: currentName, color: currentColor, allow_anyone_mention: currentAllowAnyoneMention, is_admin: currentIsAdmin, } = currentRole;
        const updatedRole = {
            name: name !== undefined ? name : currentName,
            color: color !== undefined ? color : currentColor,
            allow_anyone_mention: allow_anyone_mention !== undefined
                ? allow_anyone_mention
                : currentAllowAnyoneMention,
            is_admin: is_admin !== undefined ? is_admin : currentIsAdmin,
        };
        const response = await (0, graphql_1.default)().request(mutations_1.serverRoleMutations.UPDATE_SERVER_ROLE, {
            role_id: roleId,
            input: updatedRole,
        });
        res.status(201).json({
            id: response.updateServerRole.id,
            server_id: response.updateServerRole.server_id,
            name: response.updateServerRole.name,
            color: response.updateServerRole.color,
            position: response.updateServerRole.position,
            is_admin: response.updateServerRole.is_admin,
            default: response.updateServerRole.default,
            allow_anyone_mention: response.updateServerRole.allow_anyone_mention,
            last_modified: response.updateServerRole.last_modified,
            number_of_users: response.updateServerRole.number_of_users,
        });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.updateServerRole = updateServerRole;
const updateDefaultServerRole = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const { color, allow_anyone_mention, is_admin } = req.body;
    try {
        const { getDefaultServerRole: currentRole } = await (0, graphql_1.default)().request(queries_1.serverRoleQueries.GET_DEFAULT_SERVER_ROLE, {
            server_id: serverId,
        });
        if (!currentRole) {
            res.status(404).json({ message: "Default server role not found" });
            return;
        }
        const { color: currentColor, allow_anyone_mention: currentAllowAnyoneMention, is_admin: currentIsAdmin, } = currentRole;
        const updatedRole = {
            color: color !== undefined ? color : currentColor,
            allow_anyone_mention: allow_anyone_mention !== undefined
                ? allow_anyone_mention
                : currentAllowAnyoneMention,
            is_admin: is_admin !== undefined ? is_admin : currentIsAdmin,
        };
        const response = await (0, graphql_1.default)().request(mutations_1.serverRoleMutations.UPDATE_DEFAULT_SERVER_ROLE, {
            server_id: serverId,
            input: updatedRole,
        });
        res.status(201).json({
            id: response.updateDefaultServerRole.id,
            server_id: response.updateDefaultServerRole.server_id,
            name: response.updateDefaultServerRole.name,
            color: response.updateDefaultServerRole.color,
            position: response.updateDefaultServerRole.position,
            is_admin: response.updateDefaultServerRole.is_admin,
            default: response.updateDefaultServerRole.default,
            allow_anyone_mention: response.updateDefaultServerRole.allow_anyone_mention,
            last_modified: response.updateDefaultServerRole.last_modified,
            number_of_users: response.updateDefaultServerRole.number_of_users,
        });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.updateDefaultServerRole = updateDefaultServerRole;
const getServerRolePermissions = async (req, res, next) => {
    const { roleId } = req.params;
    const serverId = res.locals.server_id;
    try {
        const { getServerRole: role } = await (0, graphql_1.default)().request(queries_1.serverRoleQueries.GET_SERVER_ROLE, {
            role_id: roleId,
        });
        let parsedRolePermissions = null;
        try {
            parsedRolePermissions = JSON.parse(role.permissions);
        }
        catch (error) {
            res
                .status(400)
                .json({ message: "Server role permissions is not in JSON format !" });
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
exports.getServerRolePermissions = getServerRolePermissions;
const getDefaultServerRolePermissions = async (req, res, next) => {
    const serverId = res.locals.server_id;
    try {
        const { getDefaultServerRole: defaultRole } = await (0, graphql_1.default)().request(queries_1.serverRoleQueries.GET_DEFAULT_SERVER_ROLE, {
            server_id: serverId,
        });
        let parsedRolePermissions = null;
        try {
            parsedRolePermissions = JSON.parse(defaultRole.permissions);
        }
        catch (error) {
            res
                .status(400)
                .json({ message: "Server role permissions is not in JSON format !" });
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
exports.getDefaultServerRolePermissions = getDefaultServerRolePermissions;
const updateServerRolePermissions = async (req, res, next) => {
    const { roleId } = req.params;
    const updatedFields = req.body;
    let current_role_permissions = null;
    try {
        const { getServerRole: current_role } = await (0, graphql_1.default)().request(queries_1.serverRoleQueries.GET_SERVER_ROLE, {
            role_id: roleId,
        });
        if (!current_role) {
            res.status(404).json({ message: "Server role not found" });
            return;
        }
        current_role_permissions = JSON.parse(current_role.permissions);
    }
    catch (error) {
        if (error.response && error.response.errors) {
            const castError = error.response.errors.find((err) => err.extensions &&
                err.extensions.exception &&
                err.extensions.exception.kind === "ObjectId");
            if (castError) {
                res.status(404).json({ message: "Server role not found" });
                return;
            }
        }
        next(error);
        return;
    }
    for (const key in updatedFields) {
        if (updatedFields.hasOwnProperty(key)) {
            const value = updatedFields[key];
            if (!current_role_permissions.hasOwnProperty(key)) {
                res
                    .status(400)
                    .json({ message: `Invalid permission: ${key}. Permission invalid.` });
                return;
            }
            if (value !== "ALLOWED" && value !== "DENIED") {
                res.status(400).json({
                    message: `Invalid value for ${key}: ${value}. Must be "ALLOWED" or "DENIED".`,
                });
                return;
            }
        }
    }
    for (const key in current_role_permissions) {
        if (!updatedFields.hasOwnProperty(key)) {
            res.status(400).json({
                message: `Missing permission: ${key}. All permissions must be provided.`,
            });
            return;
        }
    }
    for (const key in updatedFields) {
        if (updatedFields.hasOwnProperty(key)) {
            current_role_permissions[key] = updatedFields[key];
        }
    }
    try {
        const response = await (0, graphql_1.default)().request(mutations_1.serverRoleMutations.UPDATE_SERVER_ROLE, {
            role_id: roleId,
            input: {
                permissions: JSON.stringify(current_role_permissions),
            },
        });
        let parsedRolePermissions = null;
        try {
            parsedRolePermissions = JSON.parse(response.updateServerRole.permissions);
        }
        catch (error) {
            res
                .status(400)
                .json({ message: "Server role permissions is not in JSON format !" });
            return;
        }
        res.status(201).json({ ...parsedRolePermissions });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.updateServerRolePermissions = updateServerRolePermissions;
const updatePartialServerRolePermissions = async (req, res, next) => {
    const { roleId } = req.params;
    const updatedFields = req.body;
    const { getServerRole: current_role } = await (0, graphql_1.default)().request(queries_1.serverRoleQueries.GET_SERVER_ROLE, {
        role_id: roleId,
    });
    let current_role_permissions = null;
    try {
        current_role_permissions = JSON.parse(current_role.permissions);
    }
    catch (error) {
        res.status(400).json({
            message: "Current server role permissions is not in JSON format !",
        });
        return;
    }
    for (const key in updatedFields) {
        if (updatedFields.hasOwnProperty(key)) {
            const value = updatedFields[key];
            if (!current_role_permissions.hasOwnProperty(key)) {
                res
                    .status(400)
                    .json({ message: `Invalid permission: ${key}. Permission invalid.` });
                return;
            }
            if (value !== "ALLOWED" && value !== "DENIED") {
                res.status(400).json({
                    message: `Invalid value for ${key}: ${value}. Must be "ALLOWED" or "DENIED".`,
                });
                return;
            }
        }
    }
    for (const key in updatedFields) {
        if (updatedFields.hasOwnProperty(key)) {
            current_role_permissions[key] = updatedFields[key];
        }
    }
    try {
        const response = await (0, graphql_1.default)().request(mutations_1.serverRoleMutations.UPDATE_SERVER_ROLE, {
            role_id: roleId,
            input: {
                permissions: JSON.stringify(current_role_permissions),
            },
        });
        let parsedRolePermissions = null;
        try {
            parsedRolePermissions = JSON.parse(response.updateServerRole.permissions);
        }
        catch (error) {
            res
                .status(400)
                .json({ message: "Server role permissions is not in JSON format !" });
            return;
        }
        res.status(201).json({ ...parsedRolePermissions });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.updatePartialServerRolePermissions = updatePartialServerRolePermissions;
const updateDefaultServerRolePermissions = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const updatedFields = req.body;
    const { getDefaultServerRole: defaultRole } = await (0, graphql_1.default)().request(queries_1.serverRoleQueries.GET_DEFAULT_SERVER_ROLE, {
        server_id: serverId,
    });
    let current_role_permissions = null;
    try {
        current_role_permissions = JSON.parse(defaultRole.permissions);
    }
    catch (error) {
        res.status(400).json({
            message: "Current server role permissions is not in JSON format !",
        });
        return;
    }
    for (const key in updatedFields) {
        if (updatedFields.hasOwnProperty(key)) {
            const value = updatedFields[key];
            if (!current_role_permissions.hasOwnProperty(key)) {
                res
                    .status(400)
                    .json({ message: `Invalid permission: ${key}. Permission invalid.` });
                return;
            }
            if (value !== "ALLOWED" && value !== "DENIED") {
                res.status(400).json({
                    message: `Invalid value for ${key}: ${value}. Must be "ALLOWED" or "DENIED".`,
                });
                return;
            }
        }
    }
    for (const key in current_role_permissions) {
        if (!updatedFields.hasOwnProperty(key)) {
            res.status(400).json({
                message: `Missing permission: ${key}. All permissions must be provided.`,
            });
            return;
        }
    }
    for (const key in updatedFields) {
        if (updatedFields.hasOwnProperty(key)) {
            current_role_permissions[key] = updatedFields[key];
        }
    }
    try {
        const response = await (0, graphql_1.default)().request(mutations_1.serverRoleMutations.UPDATE_DEFAULT_SERVER_ROLE, {
            server_id: serverId,
            input: {
                permissions: JSON.stringify(current_role_permissions),
            },
        });
        let parsedRolePermissions = null;
        try {
            parsedRolePermissions = JSON.parse(response.updateDefaultServerRole.permissions);
        }
        catch (error) {
            res
                .status(400)
                .json({ message: "Server role permissions is not in JSON format !" });
            return;
        }
        res.status(201).json({ ...parsedRolePermissions });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.updateDefaultServerRolePermissions = updateDefaultServerRolePermissions;
const updatePartialDefaultServerRolePermissions = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const updatedFields = req.body;
    const { getDefaultServerRole: defaultRole } = await (0, graphql_1.default)().request(queries_1.serverRoleQueries.GET_DEFAULT_SERVER_ROLE, {
        server_id: serverId,
    });
    let current_role_permissions = null;
    try {
        current_role_permissions = JSON.parse(defaultRole.permissions);
    }
    catch (error) {
        res.status(400).json({
            message: "Current server role permissions is not in JSON format !",
        });
        return;
    }
    for (const key in updatedFields) {
        if (updatedFields.hasOwnProperty(key)) {
            const value = updatedFields[key];
            if (!current_role_permissions.hasOwnProperty(key)) {
                res
                    .status(400)
                    .json({ message: `Invalid permission: ${key}. Permission invalid.` });
                return;
            }
            if (value !== "ALLOWED" && value !== "DENIED") {
                res.status(400).json({
                    message: `Invalid value for ${key}: ${value}. Must be "ALLOWED" or "DENIED".`,
                });
                return;
            }
        }
    }
    for (const key in updatedFields) {
        if (updatedFields.hasOwnProperty(key)) {
            current_role_permissions[key] = updatedFields[key];
        }
    }
    try {
        const response = await (0, graphql_1.default)().request(mutations_1.serverRoleMutations.UPDATE_DEFAULT_SERVER_ROLE, {
            server_id: serverId,
            input: {
                permissions: JSON.stringify(current_role_permissions),
            },
        });
        let parsedRolePermissions = null;
        try {
            parsedRolePermissions = JSON.parse(response.updateDefaultServerRole.permissions);
        }
        catch (error) {
            res
                .status(400)
                .json({ message: "Server role permissions is not in JSON format !" });
            return;
        }
        res.status(201).json({ ...parsedRolePermissions });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.updatePartialDefaultServerRolePermissions = updatePartialDefaultServerRolePermissions;
const getServerRoleMembers = async (req, res, next) => {
    const { roleId } = req.params;
    const serverId = res.locals.server_id;
    try {
        const { getUsersAssignedWithRole: members } = await (0, graphql_1.default)().request(queries_1.serverRoleQueries.GET_SERVER_ROLE_USERS, {
            role_id: roleId,
        });
        log_1.log.debug(members);
        res.status(201).json({
            server_id: serverId,
            role_id: roleId,
            members: members ? members : [],
        });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.getServerRoleMembers = getServerRoleMembers;
const addMemberToRole = async (req, res, next) => {
    const { roleId, userId } = req.params;
    const serverId = res.locals.server_id;
    try {
        const { addUserToRole: members } = await (0, graphql_1.default)().request(mutations_1.serverRoleMutations.ADD_USER_TO_ROLE, {
            role_id: roleId,
            user_id: userId,
        });
        res.status(201).json({
            server_id: serverId,
            role_id: roleId,
            members: members ? members : [],
        });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.addMemberToRole = addMemberToRole;
const removeMemberFromRole = async (req, res, next) => {
    const { roleId, userId } = req.params;
    const serverId = res.locals.server_id;
    try {
        const { removeUserFromRole: members } = await (0, graphql_1.default)().request(mutations_1.serverRoleMutations.REMOVE_USER_FROM_ROLE, {
            role_id: roleId,
            user_id: userId,
        });
        res.status(201).json({
            server_id: serverId,
            role_id: roleId,
            members: members ? members : [],
        });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.removeMemberFromRole = removeMemberFromRole;
const addMyselfToRole = async (req, res, next) => {
    const { roleId } = req.params;
    const userId = res.locals.uid;
    const serverId = res.locals.server_id;
    try {
        const { addUserToRole: members } = await (0, graphql_1.default)().request(mutations_1.serverRoleMutations.ADD_USER_TO_ROLE, {
            role_id: roleId,
            user_id: userId,
        });
        res.status(201).json({
            server_id: serverId,
            role_id: roleId,
            members: members ? members : [],
        });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.addMyselfToRole = addMyselfToRole;
const removeMyselfFromRole = async (req, res, next) => {
    const { roleId } = req.params;
    const userId = res.locals.uid;
    const serverId = res.locals.server_id;
    try {
        const { removeUserFromRole: members } = await (0, graphql_1.default)().request(mutations_1.serverRoleMutations.REMOVE_USER_FROM_ROLE, {
            role_id: roleId,
            user_id: userId,
        });
        res.status(201).json({
            server_id: serverId,
            role_id: roleId,
            members: members ? members : [],
        });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.removeMyselfFromRole = removeMyselfFromRole;
const getRolesAssignedWithUser = async (req, res, next) => {
    const { userId } = req.params;
    const serverId = res.locals.server_id;
    try {
        const { getRolesAssignedWithUser: roles } = await (0, graphql_1.default)().request(queries_1.serverRoleQueries.GET_ROLES_ASSIGNED_WITH_USER, {
            user_id: userId,
            server_id: serverId,
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
        res.status(201).json({
            server_id: serverId,
            user_id: userId,
            roles: filteredRoles ? filteredRoles : [],
        });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.getRolesAssignedWithUser = getRolesAssignedWithUser;
const getRolesAssignedWithMyself = async (req, res, next) => {
    const userId = res.locals.uid;
    const serverId = res.locals.server_id;
    try {
        const { getRolesAssignedWithUser: roles } = await (0, graphql_1.default)().request(queries_1.serverRoleQueries.GET_ROLES_ASSIGNED_WITH_USER, {
            user_id: userId,
            server_id: serverId,
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
        res.status(201).json({
            server_id: serverId,
            user_id: userId,
            roles: filteredRoles ? filteredRoles : [],
        });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.getRolesAssignedWithMyself = getRolesAssignedWithMyself;
const getCurrentUserPermissions = async (req, res, next) => {
    const userId = res.locals.uid;
    const serverId = res.locals.server_id;
    try {
        const { server: { owner }, } = await (0, graphql_1.default)().request(queries_1.serverQueries.GET_SERVER_BY_ID, {
            server_id: serverId,
        });
        const { getRolesAssignedWithUser: roles } = await (0, graphql_1.default)().request(queries_1.serverRoleQueries.GET_ROLES_ASSIGNED_WITH_USER, {
            user_id: userId,
            server_id: serverId,
        });
        const isAdmin = owner === userId || roles.some((role) => role.is_admin);
        const finalPermissions = roles.reduce((acc, role) => {
            let role_permissions;
            try {
                role_permissions = JSON.parse(role.permissions);
            }
            catch (error) {
                log_1.log.error("Invalid JSON in role.permissions:", role.permissions);
                return acc;
            }
            if (typeof role_permissions !== "object" || role_permissions === null) {
                log_1.log.error("role.permissions is not an object:", role_permissions);
                return acc;
            }
            for (const permission in role_permissions) {
                if (role_permissions[permission] === "ALLOWED") {
                    acc[permission] = "ALLOWED";
                }
                else if (acc[permission] !== "ALLOWED") {
                    acc[permission] = "DENIED";
                }
            }
            return acc;
        }, {});
        res.status(201).json({
            server_id: serverId,
            user_id: userId,
            is_admin: isAdmin,
            permissions: finalPermissions,
        });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.getCurrentUserPermissions = getCurrentUserPermissions;
