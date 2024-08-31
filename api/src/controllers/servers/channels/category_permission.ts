import { Request, Response, NextFunction } from 'express';
import graphQLClient from '../../../utils/graphql';
import {serverRoleQueries, serverCategoryPermissionQueries} from '../../../graphql/queries';
import {
  serverCategoryPermissionMutations,
} from '../../../graphql/mutations';

import { getUserCategoryPermissionsFunc } from '../../../utils/getUserCategoryPermissions';

export const getRolesAssignedWithCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverId = res.locals.server_id;
  const categoryId = res.locals.category_id;

  console.log(categoryId);

  try {
    const { getCategoryRolesPermissions: roles } = await graphQLClient().request(
      serverCategoryPermissionQueries.GET_CATEGORY_ROLES_PERMISSION,
      {
        category_id: categoryId,
      }
    );

    if (!roles.length) {
      return res.json({
        server_id: serverId,
        category_id: categoryId,
        roles: [],
      });
    }

    return res.json({
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
  } catch (error) {
    return next(error);
  }
};

export const getUsersAssignedWithCategoryPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverId = res.locals.server_id;
  const categoryId = res.locals.category_id;

  try {
    const { getCategoryUsersPermissions: users } = await graphQLClient().request(
      serverCategoryPermissionQueries.GET_CATEGORY_USERS_PERMISSION,
      {
        category_id: categoryId,
      }
    );

    if (!users.length) {
      return res.json({
        server_id: serverId,
        category_id: categoryId,
        users: [],
      });
    }

    return res.json({
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
  } catch (error) {
    return next(error);
  }
}

export const getRoleAssignedWithCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverId = res.locals.server_id;
  const categoryId = res.locals.category_id;
  const roleId = req.params.roleId;

  try {
    const { getCategoryRolePermission: role } = await graphQLClient().request(
      serverCategoryPermissionQueries.GET_CATEGORY_ROLE_PERMISSION,
      {
        role_id: roleId,
        category_id: categoryId,
      }
    );

    let parsedRolePermissions = null;
    try {
      parsedRolePermissions = JSON.parse(role.permissions);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Category role permissions is not in JSON format !" });
    }

    return res.status(200).json({
      ...parsedRolePermissions
    });
  } catch (error) {
    return next(error);
  }
};

export const getUserAssignedWithCategoryPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverId = res.locals.server_id;
  const categoryId = res.locals.category_id;
  const userId = req.params.userId;

  try {
    const { getCategoryUserPermission: user } = await graphQLClient().request(
      serverCategoryPermissionQueries.GET_CATEGORY_USER_PERMISSION,
      {
        user_id: userId,
        category_id: categoryId,
      }
    );

    console.log(user);

    let parsedUserPermissions = null;
    try {
      parsedUserPermissions = JSON.parse(user.permissions);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "User permissions is not in JSON format !" });
    }

    return res.status(200).json({
      ...parsedUserPermissions
    });
  } catch (error) {
    return next(error);
  }
};

export const addRoleToCategoryPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverId = res.locals.server_id;
  const categoryId = res.locals.category_id;
  const roleId = req.params.roleId;
  const updatedFields = req.body;

  try {
    // get default role and category permissions assigned to the role
    const { getDefaultServerRole: role } = await graphQLClient().request(
      serverRoleQueries.GET_DEFAULT_SERVER_ROLE,
      {
        server_id: serverId,
      }
    );

    const { getCategoryRolePermission: category } = await graphQLClient().request(
      serverCategoryPermissionQueries.GET_CATEGORY_ROLE_PERMISSION,
      {
        role_id: role.id,
        category_id: categoryId,
      }
    );

    let parsedCategoryRolePermissions = null;
    try {
      parsedCategoryRolePermissions = JSON.parse(category.permissions);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Category role permissions is not in JSON format !" });
    }

    for (const key in updatedFields) {
      if (updatedFields.hasOwnProperty(key)) {
        const value = updatedFields[key];
        if (!parsedCategoryRolePermissions.hasOwnProperty(key)) {
          return res.status(400).json({ message: `Invalid permission: ${key}. Permission invalid.` });
        }
        if (value !== "ALLOWED" && value !== "DENIED" && value !== "DEFAULT") {
          return res.status(400).json({ message: `Invalid value for ${key}: ${value}. Must be "ALLOWED" or "DENIED" or "DEFAULT".` });
        }
      }
    }

    for (const key in updatedFields) {
      if (updatedFields.hasOwnProperty(key)) {
        parsedCategoryRolePermissions[key] = updatedFields[key];
      }
    }

    const { createCategoryRolePermission: roles } = await graphQLClient().request(
      serverCategoryPermissionMutations.CREATE_CATEGORY_ROLE_PERMISSION,
      {
        role_id: roleId,
        category_id: categoryId,
        permissions: JSON.stringify(parsedCategoryRolePermissions),
      }
    );

    const filteredRoles = roles.map((role: any) => ({
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

    return res.json({
      server_id: serverId,
      category_id: categoryId,
      roles: filteredRoles ? filteredRoles : [],
    });
  } catch (error) {
    return next(error);
  }
}

export const addUserToCategoryPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverId = res.locals.server_id;
  const categoryId = res.locals.category_id;
  const userId = req.params.userId;
  const updatedFields = req.body;

  try {
    // get default role and category permissions assigned to the role
    const { getDefaultServerRole: role } = await graphQLClient().request(
      serverRoleQueries.GET_DEFAULT_SERVER_ROLE,
      {
        server_id: serverId,
      }
    );

    const { getCategoryRolePermission: category } = await graphQLClient().request(
      serverCategoryPermissionQueries.GET_CATEGORY_ROLE_PERMISSION,
      {
        role_id: role.id,
        category_id: categoryId,
      }
    );

    let parsedCategoryRolePermissions = null;
    try {
      parsedCategoryRolePermissions = JSON.parse(category.permissions);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Category role permissions is not in JSON format !" });
    }

    for (const key in updatedFields) {
      if (updatedFields.hasOwnProperty(key)) {
        const value = updatedFields[key];
        if (!parsedCategoryRolePermissions.hasOwnProperty(key)) {
          return res.status(400).json({ message: `Invalid permission: ${key}. Permission invalid.` });
        }
        if (value !== "ALLOWED" && value !== "DENIED" && value !== "DEFAULT") {
          return res.status(400).json({ message: `Invalid value for ${key}: ${value}. Must be "ALLOWED" or "DENIED" or "DEFAULT".` });
        }
      }
    }

    for (const key in updatedFields) {
      if (updatedFields.hasOwnProperty(key)) {
        parsedCategoryRolePermissions[key] = updatedFields[key];
      }
    }

    const { createCategoryUserPermission: users } = await graphQLClient().request(
      serverCategoryPermissionMutations.CREATE_CATEGORY_USER_PERMISSION,
      {
        user_id: userId,
        category_id: categoryId,
        permissions: JSON.stringify(parsedCategoryRolePermissions),
      }
    );

    const filteredUsers = users.map((user: any) => ({
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      banner_url: user.banner_url,
      about_me: user.about_me,
    }));

    return res.json({
      server_id: serverId,
      category_id: categoryId,
      users: filteredUsers ? filteredUsers : [],
    });
  } catch (error) {
    return next(error);
  }
}

export const updateRoleCategoryPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverId = res.locals.server_id;
  const categoryId = res.locals.category_id;
  const roleId = req.params.roleId;
  const updatedFields = req.body;

  try {
    const { getCategoryRolePermission: role } = await graphQLClient().request(
      serverCategoryPermissionQueries.GET_CATEGORY_ROLE_PERMISSION,
      {
        role_id: roleId,
        category_id: categoryId,
      }
    );

    let parsedRolePermissions = null;
    try {
      parsedRolePermissions = JSON.parse(role.permissions);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Category role permissions is not in JSON format !" });
    }

    for (const key in updatedFields) {
      if (updatedFields.hasOwnProperty(key)) {
        const value = updatedFields[key];
        if (!parsedRolePermissions.hasOwnProperty(key)) {
          return res.status(400).json({ message: `Invalid permission: ${key}. Permission invalid.` });
        }
        if (value !== "ALLOWED" && value !== "DENIED" && value !== "DEFAULT") {
          return res.status(400).json({ message: `Invalid value for ${key}: ${value}. Must be "ALLOWED" or "DENIED" or "DEFAULT".` });
        }
      }
    }

    // Ensure all keys in req.body are equal to permissions
    for (const key in parsedRolePermissions) {
      if (!updatedFields.hasOwnProperty(key)) {
        return res.status(400).json({ message: `Missing permission: ${key}. All permissions must be provided.` });
      }
    }

    for (const key in updatedFields) {
      if (updatedFields.hasOwnProperty(key)) {
        parsedRolePermissions[key] = updatedFields[key];
      }
    }

    const { updateCategoryRolePermission: roles } = await graphQLClient().request(
      serverCategoryPermissionMutations.UPDATE_CATEGORY_ROLE_PERMISSION,
      {
        role_id: roleId,
        category_id: categoryId,
        permissions: JSON.stringify(parsedRolePermissions),
      }
    );

    try {
      parsedRolePermissions = JSON.parse(roles.permissions);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Updated category role permissions is not in JSON format !" });
    }

    return res.status(200).json({
      ...parsedRolePermissions
    });
  } catch (error) {
    return next(error);
  }
}

export const updatePartialRoleCategoryPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverId = res.locals.server_id;
  const categoryId = res.locals.category_id;
  const roleId = req.params.roleId;
  const updatedFields = req.body;

  try {
    const { getCategoryRolePermission: role } = await graphQLClient().request(
      serverCategoryPermissionQueries.GET_CATEGORY_ROLE_PERMISSION,
      {
        role_id: roleId,
        category_id: categoryId,
      }
    );

    let parsedRolePermissions = null;
    try {
      parsedRolePermissions = JSON.parse(role.permissions);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Category role permissions is not in JSON format !" });
    }

    for (const key in updatedFields) {
      if (updatedFields.hasOwnProperty(key)) {
        const value = updatedFields[key];
        if (!parsedRolePermissions.hasOwnProperty(key)) {
          return res.status(400).json({ message: `Invalid permission: ${key}. Permission invalid.` });
        }
        if (value !== "ALLOWED" && value !== "DENIED" && value !== "DEFAULT") {
          return res.status(400).json({ message: `Invalid value for ${key}: ${value}. Must be "ALLOWED" or "DENIED" or "DEFAULT".` });
        }
      }
    }

    for (const key in updatedFields) {
      if (updatedFields.hasOwnProperty(key)) {
        parsedRolePermissions[key] = updatedFields[key];
      }
    }

    const { updateCategoryRolePermission: roles } = await graphQLClient().request(
      serverCategoryPermissionMutations.UPDATE_CATEGORY_ROLE_PERMISSION,
      {
        role_id: roleId,
        category_id: categoryId,
        permissions: JSON.stringify(parsedRolePermissions),
      }
    );

    try {
      parsedRolePermissions = JSON.parse(roles.permissions);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Updated category role permissions is not in JSON format !" });
    }

    return res.status(200).json({
      ...parsedRolePermissions
    });
  } catch (error) {
    return next(error);
  }
}

export const updateUserCategoryPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverId = res.locals.server_id;
  const categoryId = res.locals.category_id;
  const userId = req.params.userId;
  const updatedFields = req.body;

  try {
    const { getCategoryUserPermission: user } = await graphQLClient().request(
      serverCategoryPermissionQueries.GET_CATEGORY_USER_PERMISSION,
      {
        user_id: userId,
        category_id: categoryId,
      }
    );

    let parsedUserPermissions = null;
    try {
      parsedUserPermissions = JSON.parse(user.permissions);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "User permissions is not in JSON format !" });
    }

    for (const key in updatedFields) {
      if (updatedFields.hasOwnProperty(key)) {
        const value = updatedFields[key];
        if (!parsedUserPermissions.hasOwnProperty(key)) {
          return res.status(400).json({ message: `Invalid permission: ${key}. Permission invalid.` });
        }
        if (value !== "ALLOWED" && value !== "DENIED" && value !== "DEFAULT") {
          return res.status(400).json({ message: `Invalid value for ${key}: ${value}. Must be "ALLOWED" or "DENIED" or "DEFAULT".` });
        }
      }
    }

    // Ensure all keys in req.body are equal to permissions
    for (const key in parsedUserPermissions) {
      if (!updatedFields.hasOwnProperty(key)) {
        return res.status(400).json({ message: `Missing permission: ${key}. All permissions must be provided.` });
      }
    }

    for (const key in updatedFields) {
      if (updatedFields.hasOwnProperty(key)) {
        parsedUserPermissions[key] = updatedFields[key];
      }
    }

    const { updateCategoryUserPermission: users } = await graphQLClient().request(
      serverCategoryPermissionMutations.UPDATE_CATEGORY_USER_PERMISSION,
      {
        user_id: userId,
        category_id: categoryId,
        permissions: JSON.stringify(parsedUserPermissions),
      }
    );

    try {
      parsedUserPermissions = JSON.parse(users.permissions);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Updated user permissions is not in JSON format !" });
    }

    return res.status(200).json({
      ...parsedUserPermissions
    });
  } catch (error) {
    return next(error);
  }
}

export const updatePartialUserCategoryPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverId = res.locals.server_id;
  const categoryId = res.locals.category_id;
  const userId = req.params.userId;
  const updatedFields = req.body;

  try {
    const { getCategoryUserPermission: user } = await graphQLClient().request(
      serverCategoryPermissionQueries.GET_CATEGORY_USER_PERMISSION,
      {
        user_id: userId,
        category_id: categoryId,
      }
    );

    let parsedUserPermissions = null;
    try {
      parsedUserPermissions = JSON.parse(user.permissions);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "User permissions is not in JSON format !" });
    }

    for (const key in updatedFields) {
      if (updatedFields.hasOwnProperty(key)) {
        const value = updatedFields[key];
        if (!parsedUserPermissions.hasOwnProperty(key)) {
          return res.status(400).json({ message: `Invalid permission: ${key}. Permission invalid.` });
        }
        if (value !== "ALLOWED" && value !== "DENIED" && value !== "DEFAULT") {
          return res.status(400).json({ message: `Invalid value for ${key}: ${value}. Must be "ALLOWED" or "DENIED" or "DEFAULT".` });
        }
      }
    }

    for (const key in updatedFields) {
      if (updatedFields.hasOwnProperty(key)) {
        parsedUserPermissions[key] = updatedFields[key];
      }
    }

    const { updateCategoryUserPermission: users } = await graphQLClient().request(
      serverCategoryPermissionMutations.UPDATE_CATEGORY_USER_PERMISSION,
      {
        user_id: userId,
        category_id: categoryId,
        permissions: JSON.stringify(parsedUserPermissions),
      }
    );

    try {
      parsedUserPermissions = JSON.parse(users.permissions);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Updated user permissions is not in JSON format !" });
    }

    return res.status(200).json({
      ...parsedUserPermissions
    });
  } catch (error) {
    return next(error);
  }
}

export const deleteRoleCategoryPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverId = res.locals.server_id;
  const categoryId = res.locals.category_id;
  const roleId = req.params.roleId;

  try {
    const { deleteCategoryRolePermission: roles } = await graphQLClient().request(
      serverCategoryPermissionMutations.DELETE_CATEGORY_ROLE_PERMISSION,
      {
        role_id: roleId,
        category_id: categoryId,
      }
    );

    const filteredRoles = roles.map((role: any) => ({
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

    return res.json({
      server_id: serverId,
      category_id: categoryId,
      roles: filteredRoles ? filteredRoles : [],
    });
  } catch (error) {
    return next(error);
  }
}

export const deleteUserCategoryPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverId = res.locals.server_id;
  const categoryId = res.locals.category_id;
  const userId = req.params.userId;

  try {
    const { deleteCategoryUserPermission: users } = await graphQLClient().request(
      serverCategoryPermissionMutations.DELETE_CATEGORY_USER_PERMISSION,
      {
        user_id: userId,
        category_id: categoryId,
      }
    );

    const filteredUsers = users.map((user: any) => ({
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      banner_url: user.banner_url,
      about_me: user.about_me,
    }));

    return res.json({
      server_id: serverId,
      category_id: categoryId,
      users: filteredUsers ? filteredUsers : [],
    });
  } catch (error) {
    return next(error);
  }
}

/*
* - get all server roles assigned with the current user
- for each server role, get the category permissions associated with that role (if exists)
    + If exists, then calculate the final category permissions associated with that role
        * The way we combine is, if the category permission is "DEFAULT", then it will inherit the permission value from server role permissions
        * Otherwise, keep it (in other word, if the value associated with the corresponding category permission is "ALLOWED" or "DENIED", keep it)
    + Otherwise, the final category permission associated with that role is the server role permissions
- Calculate the combined category permissions associated with those roles
    * That is, for each permission, if there exists a role with permission value "ALLOWED", the corresponding permission value will be "ALLOWED", otherwise, "DENIED"
- get category permissions assigned with the current user (if exists)
    + If exists, we will calculate the final category permissions for that user
        * If the corresponding permission value is "DENIED" or "ALLOWED", override that value to the corresponding category permissions
        * Otherwise, keep it
* */
export const getUserCategoryPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = res.locals.uid;
  const categoryId = res.locals.category_id;
  const serverId = res.locals.server_id;

  console.log(userId, categoryId, serverId);

  try {
    const userCategoryPermissions = await getUserCategoryPermissionsFunc(userId, categoryId, serverId);

    return res.json({
      server_id: serverId,
      user_id: userId,
      category_id: categoryId,
      permissions: userCategoryPermissions,
    });
  } catch (error) {
    return next(error);
  }
}
