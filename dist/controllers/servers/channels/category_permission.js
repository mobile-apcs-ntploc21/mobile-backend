"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCategoryPermissions = exports.deleteUserCategoryPermission = exports.deleteRoleCategoryPermission = exports.updatePartialUserCategoryPermission = exports.updateUserCategoryPermission = exports.updatePartialRoleCategoryPermission = exports.updateRoleCategoryPermission = exports.addUserToCategoryPermission = exports.addRoleToCategoryPermission = exports.getUserAssignedWithCategoryPermission = exports.getRoleAssignedWithCategory = exports.getUsersAssignedWithCategoryPermission = exports.getRolesAssignedWithCategory = void 0;
const graphql_1 = __importDefault(require("@/utils/graphql"));
const queries_1 = require("@/graphql/queries");
const mutations_1 = require("@/graphql/mutations");
const getUserCategoryPermissions_1 = require("@/utils/getUserCategoryPermissions");
const log_1 = require("@/utils/log");
const getRolesAssignedWithCategory = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const categoryId = res.locals.category_id;
    log_1.log.debug(categoryId);
    try {
        const { getCategoryRolesPermissions: roles } = await (0, graphql_1.default)().request(queries_1.serverCategoryPermissionQueries.GET_CATEGORY_ROLES_PERMISSION, {
            category_id: categoryId,
        });
        if (!roles.length) {
            res.json({
                server_id: serverId,
                category_id: categoryId,
                roles: [],
            });
            return;
        }
        res.json({
            server_id: serverId,
            category_id: categoryId,
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
exports.getRolesAssignedWithCategory = getRolesAssignedWithCategory;
const getUsersAssignedWithCategoryPermission = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const categoryId = res.locals.category_id;
    try {
        const { getCategoryUsersPermissions: users } = await (0, graphql_1.default)().request(queries_1.serverCategoryPermissionQueries.GET_CATEGORY_USERS_PERMISSION, {
            category_id: categoryId,
        });
        if (!users.length) {
            res.json({
                server_id: serverId,
                category_id: categoryId,
                users: [],
            });
            return;
        }
        res.json({
            server_id: serverId,
            category_id: categoryId,
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
exports.getUsersAssignedWithCategoryPermission = getUsersAssignedWithCategoryPermission;
const getRoleAssignedWithCategory = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const categoryId = res.locals.category_id;
    const roleId = req.params.roleId;
    try {
        const { getCategoryRolePermission: role } = await (0, graphql_1.default)().request(queries_1.serverCategoryPermissionQueries.GET_CATEGORY_ROLE_PERMISSION, {
            role_id: roleId,
            category_id: categoryId,
        });
        let parsedRolePermissions = null;
        try {
            parsedRolePermissions = JSON.parse(role.permissions);
        }
        catch (error) {
            res
                .status(400)
                .json({ message: "Category role permissions is not in JSON format !" });
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
exports.getRoleAssignedWithCategory = getRoleAssignedWithCategory;
const getUserAssignedWithCategoryPermission = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const categoryId = res.locals.category_id;
    const userId = req.params.userId;
    try {
        const { getCategoryUserPermission: user } = await (0, graphql_1.default)().request(queries_1.serverCategoryPermissionQueries.GET_CATEGORY_USER_PERMISSION, {
            user_id: userId,
            category_id: categoryId,
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
exports.getUserAssignedWithCategoryPermission = getUserAssignedWithCategoryPermission;
const addRoleToCategoryPermission = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const categoryId = res.locals.category_id;
    const roleId = req.params.roleId;
    const updatedFields = req.body;
    try {
        const { getDefaultServerRole: role } = await (0, graphql_1.default)().request(queries_1.serverRoleQueries.GET_DEFAULT_SERVER_ROLE, {
            server_id: serverId,
        });
        const { getCategoryRolePermission: category } = await (0, graphql_1.default)().request(queries_1.serverCategoryPermissionQueries.GET_CATEGORY_ROLE_PERMISSION, {
            role_id: role.id,
            category_id: categoryId,
        });
        let parsedCategoryRolePermissions = null;
        try {
            parsedCategoryRolePermissions = JSON.parse(category.permissions);
        }
        catch (error) {
            res
                .status(400)
                .json({ message: "Category role permissions is not in JSON format !" });
            return;
        }
        for (const key in updatedFields) {
            if (updatedFields.hasOwnProperty(key)) {
                const value = updatedFields[key];
                if (!parsedCategoryRolePermissions.hasOwnProperty(key)) {
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
                parsedCategoryRolePermissions[key] = updatedFields[key];
            }
        }
        const { createCategoryRolePermission: roles } = await (0, graphql_1.default)().request(mutations_1.serverCategoryPermissionMutations.CREATE_CATEGORY_ROLE_PERMISSION, {
            role_id: roleId,
            category_id: categoryId,
            permissions: JSON.stringify(parsedCategoryRolePermissions),
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
            category_id: categoryId,
            roles: filteredRoles ? filteredRoles : [],
        });
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.addRoleToCategoryPermission = addRoleToCategoryPermission;
const addUserToCategoryPermission = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const categoryId = res.locals.category_id;
    const userId = req.params.userId;
    const updatedFields = req.body;
    try {
        const { getDefaultServerRole: role } = await (0, graphql_1.default)().request(queries_1.serverRoleQueries.GET_DEFAULT_SERVER_ROLE, {
            server_id: serverId,
        });
        const { getCategoryRolePermission: category } = await (0, graphql_1.default)().request(queries_1.serverCategoryPermissionQueries.GET_CATEGORY_ROLE_PERMISSION, {
            role_id: role.id,
            category_id: categoryId,
        });
        let parsedCategoryRolePermissions = null;
        try {
            parsedCategoryRolePermissions = JSON.parse(category.permissions);
        }
        catch (error) {
            res
                .status(400)
                .json({ message: "Category role permissions is not in JSON format !" });
            return;
        }
        for (const key in updatedFields) {
            if (updatedFields.hasOwnProperty(key)) {
                const value = updatedFields[key];
                if (!parsedCategoryRolePermissions.hasOwnProperty(key)) {
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
                parsedCategoryRolePermissions[key] = updatedFields[key];
            }
        }
        const { createCategoryUserPermission: users } = await (0, graphql_1.default)().request(mutations_1.serverCategoryPermissionMutations.CREATE_CATEGORY_USER_PERMISSION, {
            user_id: userId,
            category_id: categoryId,
            permissions: JSON.stringify(parsedCategoryRolePermissions),
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
            category_id: categoryId,
            users: filteredUsers ? filteredUsers : [],
        });
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.addUserToCategoryPermission = addUserToCategoryPermission;
const updateRoleCategoryPermission = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const categoryId = res.locals.category_id;
    const roleId = req.params.roleId;
    const updatedFields = req.body;
    try {
        const { getCategoryRolePermission: role } = await (0, graphql_1.default)().request(queries_1.serverCategoryPermissionQueries.GET_CATEGORY_ROLE_PERMISSION, {
            role_id: roleId,
            category_id: categoryId,
        });
        let parsedRolePermissions = null;
        try {
            parsedRolePermissions = JSON.parse(role.permissions);
        }
        catch (error) {
            res
                .status(400)
                .json({ message: "Category role permissions is not in JSON format !" });
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
        const { updateCategoryRolePermission: roles } = await (0, graphql_1.default)().request(mutations_1.serverCategoryPermissionMutations.UPDATE_CATEGORY_ROLE_PERMISSION, {
            role_id: roleId,
            category_id: categoryId,
            permissions: JSON.stringify(parsedRolePermissions),
        });
        try {
            parsedRolePermissions = JSON.parse(roles.permissions);
        }
        catch (error) {
            res.status(400).json({
                message: "Updated category role permissions is not in JSON format !",
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
exports.updateRoleCategoryPermission = updateRoleCategoryPermission;
const updatePartialRoleCategoryPermission = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const categoryId = res.locals.category_id;
    const roleId = req.params.roleId;
    const updatedFields = req.body;
    try {
        const { getCategoryRolePermission: role } = await (0, graphql_1.default)().request(queries_1.serverCategoryPermissionQueries.GET_CATEGORY_ROLE_PERMISSION, {
            role_id: roleId,
            category_id: categoryId,
        });
        let parsedRolePermissions = null;
        try {
            parsedRolePermissions = JSON.parse(role.permissions);
        }
        catch (error) {
            res
                .status(400)
                .json({ message: "Category role permissions is not in JSON format !" });
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
        const { updateCategoryRolePermission: roles } = await (0, graphql_1.default)().request(mutations_1.serverCategoryPermissionMutations.UPDATE_CATEGORY_ROLE_PERMISSION, {
            role_id: roleId,
            category_id: categoryId,
            permissions: JSON.stringify(parsedRolePermissions),
        });
        try {
            parsedRolePermissions = JSON.parse(roles.permissions);
        }
        catch (error) {
            res.status(400).json({
                message: "Updated category role permissions is not in JSON format !",
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
exports.updatePartialRoleCategoryPermission = updatePartialRoleCategoryPermission;
const updateUserCategoryPermission = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const categoryId = res.locals.category_id;
    const userId = req.params.userId;
    const updatedFields = req.body;
    try {
        const { getCategoryUserPermission: user } = await (0, graphql_1.default)().request(queries_1.serverCategoryPermissionQueries.GET_CATEGORY_USER_PERMISSION, {
            user_id: userId,
            category_id: categoryId,
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
        const { updateCategoryUserPermission: users } = await (0, graphql_1.default)().request(mutations_1.serverCategoryPermissionMutations.UPDATE_CATEGORY_USER_PERMISSION, {
            user_id: userId,
            category_id: categoryId,
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
exports.updateUserCategoryPermission = updateUserCategoryPermission;
const updatePartialUserCategoryPermission = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const categoryId = res.locals.category_id;
    const userId = req.params.userId;
    const updatedFields = req.body;
    try {
        const { getCategoryUserPermission: user } = await (0, graphql_1.default)().request(queries_1.serverCategoryPermissionQueries.GET_CATEGORY_USER_PERMISSION, {
            user_id: userId,
            category_id: categoryId,
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
        const { updateCategoryUserPermission: users } = await (0, graphql_1.default)().request(mutations_1.serverCategoryPermissionMutations.UPDATE_CATEGORY_USER_PERMISSION, {
            user_id: userId,
            category_id: categoryId,
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
exports.updatePartialUserCategoryPermission = updatePartialUserCategoryPermission;
const deleteRoleCategoryPermission = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const categoryId = res.locals.category_id;
    const roleId = req.params.roleId;
    try {
        const { deleteCategoryRolePermission: roles } = await (0, graphql_1.default)().request(mutations_1.serverCategoryPermissionMutations.DELETE_CATEGORY_ROLE_PERMISSION, {
            role_id: roleId,
            category_id: categoryId,
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
            category_id: categoryId,
            roles: filteredRoles ? filteredRoles : [],
        });
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.deleteRoleCategoryPermission = deleteRoleCategoryPermission;
const deleteUserCategoryPermission = async (req, res, next) => {
    const serverId = res.locals.server_id;
    const categoryId = res.locals.category_id;
    const userId = req.params.userId;
    try {
        const { deleteCategoryUserPermission: users } = await (0, graphql_1.default)().request(mutations_1.serverCategoryPermissionMutations.DELETE_CATEGORY_USER_PERMISSION, {
            user_id: userId,
            category_id: categoryId,
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
            category_id: categoryId,
            users: filteredUsers ? filteredUsers : [],
        });
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.deleteUserCategoryPermission = deleteUserCategoryPermission;
const getUserCategoryPermissions = async (req, res, next) => {
    const userId = res.locals.uid;
    const categoryId = res.locals.category_id;
    const serverId = res.locals.server_id;
    log_1.log.debug(userId, categoryId, serverId);
    try {
        const userCategoryPermissions = await (0, getUserCategoryPermissions_1.getUserCategoryPermissionsFunc)(userId, categoryId, serverId);
        res.json({
            server_id: serverId,
            user_id: userId,
            category_id: categoryId,
            permissions: userCategoryPermissions,
        });
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.getUserCategoryPermissions = getUserCategoryPermissions;
