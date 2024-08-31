import { Request, Response, NextFunction } from 'express';
import graphQLClient from '../../../utils/graphql';
import {serverRoleQueries, serverChannelPermissionQueries} from '../../../graphql/queries';
import {
  serverChannelPermissionMutations,
} from '../../../graphql/mutations';

import { getUserChannelPermissionsFunc } from '../../../utils/getUserChannelPermissions';

export const getRolesAssignedWithChannel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverId = res.locals.server_id;
  const channelId = res.locals.channel_id;

  console.log(channelId);

  try {
    const { getChannelRolesPermissions: roles } = await graphQLClient().request(
      serverChannelPermissionQueries.GET_CHANNEL_ROLES_PERMISSION,
      {
        channel_id: channelId,
      }
    );

    if (!roles.length) {
      return res.json({
        server_id: serverId,
        channel_id: channelId,
        roles: [],
      });
    }

    return res.json({
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
  } catch (error) {
    return next(error);
  }
};

export const getUsersAssignedWithChannelPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverId = res.locals.server_id;
  const channelId = res.locals.channel_id;

  try {
    const { getChannelUsersPermissions: users } = await graphQLClient().request(
      serverChannelPermissionQueries.GET_CHANNEL_USERS_PERMISSION,
      {
        channel_id: channelId,
      }
    );

    if (!users.length) {
      return res.json({
        server_id: serverId,
        channel_id: channelId,
        users: [],
      });
    }

    return res.json({
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
  } catch (error) {
    return next(error);
  }
}

export const getRoleAssignedWithChannel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverId = res.locals.server_id;
  const channelId = res.locals.channel_id;
  const roleId = req.params.roleId;

  try {
    const { getChannelRolePermission: role } = await graphQLClient().request(
      serverChannelPermissionQueries.GET_CHANNEL_ROLE_PERMISSION,
      {
        role_id: roleId,
        channel_id: channelId,
      }
    );

    let parsedRolePermissions = null;
    try {
      parsedRolePermissions = JSON.parse(role.permissions);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Channel role permissions is not in JSON format !" });
    }

    return res.status(200).json({
      ...parsedRolePermissions
    });
  } catch (error) {
    return next(error);
  }
};

export const getUserAssignedWithChannelPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverId = res.locals.server_id;
  const channelId = res.locals.channel_id;
  const userId = req.params.userId;

  try {
    const { getChannelUserPermission: user } = await graphQLClient().request(
      serverChannelPermissionQueries.GET_CHANNEL_USER_PERMISSION,
      {
        user_id: userId,
        channel_id: channelId,
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

export const addRoleToChannelPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverId = res.locals.server_id;
  const channelId = res.locals.channel_id;
  const roleId = req.params.roleId;
  const updatedFields = req.body;

  try {
    // get default role and channel permissions assigned to the role
    const { getDefaultServerRole: role } = await graphQLClient().request(
      serverRoleQueries.GET_DEFAULT_SERVER_ROLE,
      {
        server_id: serverId,
      }
    );

    const { getChannelRolePermission: channel } = await graphQLClient().request(
      serverChannelPermissionQueries.GET_CHANNEL_ROLE_PERMISSION,
      {
        role_id: role.id,
        channel_id: channelId,
      }
    );

    let parsedChannelRolePermissions = null;
    try {
      parsedChannelRolePermissions = JSON.parse(channel.permissions);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Channel role permissions is not in JSON format !" });
    }

    for (const key in updatedFields) {
      if (updatedFields.hasOwnProperty(key)) {
        const value = updatedFields[key];
        if (!parsedChannelRolePermissions.hasOwnProperty(key)) {
          return res.status(400).json({ message: `Invalid permission: ${key}. Permission invalid.` });
        }
        if (value !== "ALLOWED" && value !== "DENIED" && value !== "DEFAULT") {
          return res.status(400).json({ message: `Invalid value for ${key}: ${value}. Must be "ALLOWED" or "DENIED" or "DEFAULT".` });
        }
      }
    }

    for (const key in updatedFields) {
      if (updatedFields.hasOwnProperty(key)) {
        parsedChannelRolePermissions[key] = updatedFields[key];
      }
    }

    const { createChannelRolePermission: roles } = await graphQLClient().request(
      serverChannelPermissionMutations.CREATE_CHANNEL_ROLE_PERMISSION,
      {
        role_id: roleId,
        channel_id: channelId,
        permissions: JSON.stringify(parsedChannelRolePermissions),
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
      channel_id: channelId,
      roles: filteredRoles ? filteredRoles : [],
    });
  } catch (error) {
    return next(error);
  }
}

export const addUserToChannelPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverId = res.locals.server_id;
  const channelId = res.locals.channel_id;
  const userId = req.params.userId;
  const updatedFields = req.body;

  try {
    // get default role and channel permissions assigned to the role
    const { getDefaultServerRole: role } = await graphQLClient().request(
      serverRoleQueries.GET_DEFAULT_SERVER_ROLE,
      {
        server_id: serverId,
      }
    );

    const { getChannelRolePermission: channel } = await graphQLClient().request(
      serverChannelPermissionQueries.GET_CHANNEL_ROLE_PERMISSION,
      {
        role_id: role.id,
        channel_id: channelId,
      }
    );

    let parsedChannelRolePermissions = null;
    try {
      parsedChannelRolePermissions = JSON.parse(channel.permissions);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Channel role permissions is not in JSON format !" });
    }

    for (const key in updatedFields) {
      if (updatedFields.hasOwnProperty(key)) {
        const value = updatedFields[key];
        if (!parsedChannelRolePermissions.hasOwnProperty(key)) {
          return res.status(400).json({ message: `Invalid permission: ${key}. Permission invalid.` });
        }
        if (value !== "ALLOWED" && value !== "DENIED" && value !== "DEFAULT") {
          return res.status(400).json({ message: `Invalid value for ${key}: ${value}. Must be "ALLOWED" or "DENIED" or "DEFAULT".` });
        }
      }
    }

    for (const key in updatedFields) {
      if (updatedFields.hasOwnProperty(key)) {
        parsedChannelRolePermissions[key] = updatedFields[key];
      }
    }

    const { createChannelUserPermission: users } = await graphQLClient().request(
      serverChannelPermissionMutations.CREATE_CHANNEL_USER_PERMISSION,
      {
        user_id: userId,
        channel_id: channelId,
        permissions: JSON.stringify(parsedChannelRolePermissions),
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
      channel_id: channelId,
      users: filteredUsers ? filteredUsers : [],
    });
  } catch (error) {
    return next(error);
  }
}

export const updateRoleChannelPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverId = res.locals.server_id;
  const channelId = res.locals.channel_id;
  const roleId = req.params.roleId;
  const updatedFields = req.body;

  try {
    const { getChannelRolePermission: role } = await graphQLClient().request(
      serverChannelPermissionQueries.GET_CHANNEL_ROLE_PERMISSION,
      {
        role_id: roleId,
        channel_id: channelId,
      }
    );

    let parsedRolePermissions = null;
    try {
      parsedRolePermissions = JSON.parse(role.permissions);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Channel role permissions is not in JSON format !" });
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

    const { updateChannelRolePermission: roles } = await graphQLClient().request(
      serverChannelPermissionMutations.UPDATE_CHANNEL_ROLE_PERMISSION,
      {
        role_id: roleId,
        channel_id: channelId,
        permissions: JSON.stringify(parsedRolePermissions),
      }
    );

    try {
      parsedRolePermissions = JSON.parse(roles.permissions);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Updated channel role permissions is not in JSON format !" });
    }

    return res.status(200).json({
      ...parsedRolePermissions
    });
  } catch (error) {
    return next(error);
  }
}

export const updatePartialRoleChannelPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverId = res.locals.server_id;
  const channelId = res.locals.channel_id;
  const roleId = req.params.roleId;
  const updatedFields = req.body;

  try {
    const { getChannelRolePermission: role } = await graphQLClient().request(
      serverChannelPermissionQueries.GET_CHANNEL_ROLE_PERMISSION,
      {
        role_id: roleId,
        channel_id: channelId,
      }
    );

    let parsedRolePermissions = null;
    try {
      parsedRolePermissions = JSON.parse(role.permissions);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Channel role permissions is not in JSON format !" });
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

    const { updateChannelRolePermission: roles } = await graphQLClient().request(
      serverChannelPermissionMutations.UPDATE_CHANNEL_ROLE_PERMISSION,
      {
        role_id: roleId,
        channel_id: channelId,
        permissions: JSON.stringify(parsedRolePermissions),
      }
    );

    try {
      parsedRolePermissions = JSON.parse(roles.permissions);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Updated channel role permissions is not in JSON format !" });
    }

    return res.status(200).json({
      ...parsedRolePermissions
    });
  } catch (error) {
    return next(error);
  }
}

export const updateUserChannelPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverId = res.locals.server_id;
  const channelId = res.locals.channel_id;
  const userId = req.params.userId;
  const updatedFields = req.body;

  try {
    const { getChannelUserPermission: user } = await graphQLClient().request(
      serverChannelPermissionQueries.GET_CHANNEL_USER_PERMISSION,
      {
        user_id: userId,
        channel_id: channelId,
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

    const { updateChannelUserPermission: users } = await graphQLClient().request(
      serverChannelPermissionMutations.UPDATE_CHANNEL_USER_PERMISSION,
      {
        user_id: userId,
        channel_id: channelId,
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

export const updatePartialUserChannelPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverId = res.locals.server_id;
  const channelId = res.locals.channel_id;
  const userId = req.params.userId;
  const updatedFields = req.body;

  try {
    const { getChannelUserPermission: user } = await graphQLClient().request(
      serverChannelPermissionQueries.GET_CHANNEL_USER_PERMISSION,
      {
        user_id: userId,
        channel_id: channelId,
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

    const { updateChannelUserPermission: users } = await graphQLClient().request(
      serverChannelPermissionMutations.UPDATE_CHANNEL_USER_PERMISSION,
      {
        user_id: userId,
        channel_id: channelId,
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

export const deleteRoleChannelPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverId = res.locals.server_id;
  const channelId = res.locals.channel_id;
  const roleId = req.params.roleId;

  try {
    const { deleteChannelRolePermission: roles } = await graphQLClient().request(
      serverChannelPermissionMutations.DELETE_CHANNEL_ROLE_PERMISSION,
      {
        role_id: roleId,
        channel_id: channelId,
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
      channel_id: channelId,
      roles: filteredRoles ? filteredRoles : [],
    });
  } catch (error) {
    return next(error);
  }
}

export const deleteUserChannelPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverId = res.locals.server_id;
  const channelId = res.locals.channel_id;
  const userId = req.params.userId;

  try {
    const { deleteChannelUserPermission: users } = await graphQLClient().request(
      serverChannelPermissionMutations.DELETE_CHANNEL_USER_PERMISSION,
      {
        user_id: userId,
        channel_id: channelId,
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
      channel_id: channelId,
      users: filteredUsers ? filteredUsers : [],
    });
  } catch (error) {
    return next(error);
  }
}

export const getUserChannelPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = res.locals.uid;
  const channelId = res.locals.channel_id;
  const serverId = res.locals.server_id;

  console.log(userId, channelId, serverId);

  try {
    const userChannelPermissions = await getUserChannelPermissionsFunc(userId, channelId, serverId);

    return res.json({
      server_id: serverId,
      user_id: userId,
      channel_id: channelId,
      permissions: userChannelPermissions,
    });
  } catch (error) {
    return next(error);
  }
}
