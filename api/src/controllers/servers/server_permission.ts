import { Request, Response, NextFunction } from 'express';
import graphQLClient from '../../utils/graphql';
import { serverRoleQueries, serverQueries } from '../../graphql/queries';
import {serverMemberMutations, serverRoleMutations} from '../../graphql/mutations';

export const getServerRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverId = res.locals.server_id;

  try {
    const { getServerRoles: roles } = await graphQLClient().request(
      serverRoleQueries.GET_SERVER_ROLES,
      {
        server_id: serverId,
      }
    );

    if (!roles) {
      return res.status(404).json({message: "Server not found"});
    }

    if (roles.length === 0) return res.json([]);

    return res.json({
      server_id: serverId,
      roles: roles.map((role: any) => {
        return {
          id: role.id,
          name: role.name,
          color: role.color,
          position: role.position,
          is_admin: role.is_admin,
          allow_anyone_mention: role.allow_anyone_mention,
          last_modified: role.last_modified,
          number_of_users: role.number_of_users,
        };
      })
    });
  } catch (error) {
    return next(error);
  }
};

export const getServerRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { roleId } = req.params;
  const serverId = res.locals.server_id;

  try {
    const { getServerRole: role } = await graphQLClient().request(
      serverRoleQueries.GET_SERVER_ROLE,
      {
        role_id: roleId,
      }
    );

    return res.json({
      id: role.id,
      server_id: role.server_id,
      name: role.name,
      color: role.color,
      position: role.position,
      is_admin: role.is_admin,
      allow_anyone_mention: role.allow_anyone_mention,
      last_modified: role.last_modified,
      number_of_users: role.number_of_users,
    });
  } catch (error) {
    return next(error);
  }
};

export const createServerRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverId = res.locals.server_id;
  const { name, color, allow_anyone_mention, is_admin } = req.body;

  if (!name) {
    return res
      .status(400)
      .json({ message: "Name for the server role is required." });
  }

  try {
    const response = await graphQLClient().request(
      serverRoleMutations.CREATE_SERVER_ROLE,
      {
        server_id: serverId,
        input: {
          name,
          color,
          allow_anyone_mention,
          is_admin
        },
      }
    );

    return res.status(201).json({
      id: response.createServerRole.id,
      server_id: response.createServerRole.server_id,
      name: response.createServerRole.name,
      color: response.createServerRole.color,
      position: response.createServerRole.position,
      is_admin: response.createServerRole.is_admin,
      allow_anyone_mention: response.createServerRole.allow_anyone_mention,
      last_modified: response.createServerRole.last_modified,
      number_of_users: response.createServerRole.number_of_users,
    });
  } catch (error) {
    return next(error);
  }
}

export const deleteServerRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { roleId } = req.params;

  try {
    const response = await graphQLClient().request(
      serverRoleMutations.DELETE_SERVER_ROLE,
      {
        role_id: roleId,
      }
    );

    return res.status(201).json({
      id: response.deleteServerRole.id,
      server_id: response.deleteServerRole.server_id,
      name: response.deleteServerRole.name,
      color: response.deleteServerRole.color,
      position: response.deleteServerRole.position,
      is_admin: response.deleteServerRole.is_admin,
      allow_anyone_mention: response.deleteServerRole.allow_anyone_mention,
      last_modified: response.deleteServerRole.last_modified,
      number_of_users: response.deleteServerRole.number_of_users,
    });
  } catch (error) {
    return next(error);
  }
}

export const updateServerRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { roleId } = req.params;
  const { name, color, allow_anyone_mention, is_admin } = req.body;

  let input: {name?: string, color?: string, allow_anyone_mention?: boolean, is_admin?: boolean} = {
    ... (name && { name }),
    ... (color && { color }),
    ... (allow_anyone_mention && { allow_anyone_mention }),
    ... (is_admin && { is_admin }),
  };

  try {
    const response = await graphQLClient().request(
      serverRoleMutations.UPDATE_SERVER_ROLE,
      {
        role_id: roleId,
        input: input,
      }
    );

    return res.status(201).json({
      id: response.updateServerRole.id,
      server_id: response.updateServerRole.server_id,
      name: response.updateServerRole.name,
      color: response.updateServerRole.color,
      position: response.updateServerRole.position,
      is_admin: response.updateServerRole.is_admin,
      allow_anyone_mention: response.updateServerRole.allow_anyone_mention,
      last_modified: response.updateServerRole.last_modified,
      number_of_users: response.updateServerRole.number_of_users
    });
  } catch (error) {
    return next(error);
  }
}

export const getServerRolePermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { roleId } = req.params;
  const serverId = res.locals.server_id;

  try {
    const { getServerRole: role } = await graphQLClient().request(
      serverRoleQueries.GET_SERVER_ROLE,
      {
        role_id: roleId,
      }
    );

    let parsedRolePermissions = null;
    try {
      parsedRolePermissions = JSON.parse(role.permissions);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Server role permissions is not in JSON format !" });
    }


    return res.status(200).json({
      ...parsedRolePermissions
    });
  } catch (error) {
    return next(error);
  }
};

export const updateServerRolePermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { roleId } = req.params;
  const updatedFields = req.body;

  let current_role_permissions = null;
  try {
    const { getServerRole: current_role } = await graphQLClient().request(
      serverRoleQueries.GET_SERVER_ROLE,
      {
        role_id: roleId,
      }
    );

    if (!current_role) {
      return res.status(404).json({message: "Server role not found"});
    }

    current_role_permissions = JSON.parse(current_role.permissions);
  } catch (error) {
    if (error.response && error.response.errors) {
      const castError = error.response.errors.find(
        (err: any) => err.extensions && err.extensions.exception && err.extensions.exception.kind === "ObjectId"
      );
      if (castError) {
        return res.status(404).json({ message: "Server role not found" });
      }
    }
    return next(error);
  }

  // Validate updatedFields keys and values
  for (const key in updatedFields) {
    if (updatedFields.hasOwnProperty(key)) {
      const value = updatedFields[key];
      if (!current_role_permissions.hasOwnProperty(key)) {
        return res.status(400).json({ message: `Invalid permission: ${key}. Permission invalid.` });
      }
      if (value !== "ALLOWED" && value !== "DENIED") {
        return res.status(400).json({ message: `Invalid value for ${key}: ${value}. Must be "ALLOWED" or "DENIED".` });
      }
    }
  }

  // Ensure all keys in req.body are equal to permissions
  for (const key in current_role_permissions) {
    if (!updatedFields.hasOwnProperty(key)) {
      return res.status(400).json({ message: `Missing permission: ${key}. All permissions must be provided.` });
    }
  }

  for (const key in updatedFields) {
    if (updatedFields.hasOwnProperty(key)) {
      current_role_permissions[key] = updatedFields[key];
    }
  }

  try {
    const response = await graphQLClient().request(
      serverRoleMutations.UPDATE_SERVER_ROLE,
      {
        role_id: roleId,
        input: {
          permissions: JSON.stringify(current_role_permissions),
        },
      }
    );

    let parsedRolePermissions = null;
    try {
      parsedRolePermissions = JSON.parse(response.updateServerRole.permissions);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Server role permissions is not in JSON format !" });
    }

    return res.status(201).json({ ...parsedRolePermissions });
  } catch (error) {
    return next(error);
  }
}

export const updatePartialServerRolePermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { roleId } = req.params;
  const updatedFields = req.body;

  const { getServerRole: current_role } = await graphQLClient().request(
    serverRoleQueries.GET_SERVER_ROLE,
    {
      role_id: roleId,
    }
  );

  let current_role_permissions = null;
  try {
    current_role_permissions = JSON.parse(current_role.permissions);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Current server role permissions is not in JSON format !" });
  }

  // Validate updatedFields keys and values
  for (const key in updatedFields) {
    if (updatedFields.hasOwnProperty(key)) {
      const value = updatedFields[key];
      if (!current_role_permissions.hasOwnProperty(key)) {
        return res.status(400).json({ message: `Invalid permission: ${key}. Permission invalid.` });
      }
      if (value !== "ALLOWED" && value !== "DENIED") {
        return res.status(400).json({ message: `Invalid value for ${key}: ${value}. Must be "ALLOWED" or "DENIED".` });
      }
    }
  }

  for (const key in updatedFields) {
    if (updatedFields.hasOwnProperty(key)) {
      current_role_permissions[key] = updatedFields[key];
    }
  }

  try {
    const response = await graphQLClient().request(
      serverRoleMutations.UPDATE_SERVER_ROLE,
      {
        role_id: roleId,
        input: {
          permissions: JSON.stringify(current_role_permissions),
        },
      }
    );

    let parsedRolePermissions = null;
    try {
      parsedRolePermissions = JSON.parse(response.updateServerRole.permissions);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Server role permissions is not in JSON format !" });
    }

    return res.status(201).json({ ...parsedRolePermissions });
  } catch (error) {
    return next(error);
  }
}

export const getServerRoleMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { roleId } = req.params;
  const serverId = res.locals.server_id;

  try {
    const { getUsersAssignedWithRole: members } = await graphQLClient().request(
      serverRoleQueries.GET_SERVER_ROLE_USERS,
      {
        role_id: roleId,
      }
    );

    console.log(members);

    return res.status(201).json({
      server_id: serverId,
      role_id: roleId,
      members: members ? members : []
    });
  } catch (error) {
    return next(error);
  }
}

export const addMemberToRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { roleId, userId } = req.params;
  const serverId = res.locals.server_id;

  try {
    const { addUserToRole: members } = await graphQLClient().request(
      serverRoleMutations.ADD_USER_TO_ROLE,
      {
        role_id: roleId,
        user_id: userId,
      }
    );

    return res.status(201).json({
      server_id: serverId,
      role_id: roleId,
      members: members ? members : []
    });
  } catch (error) {
    return next(error);
  }
}

export const removeMemberFromRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { roleId, userId } = req.params;
  const serverId = res.locals.server_id;

  try {
    const { removeUserFromRole: members } = await graphQLClient().request(
      serverRoleMutations.REMOVE_USER_FROM_ROLE,
      {
        role_id: roleId,
        user_id: userId,
      }
    );

    return res.status(201).json({
      server_id: serverId,
      role_id: roleId,
      members: members ? members : []
    });
  } catch (error) {
    return next(error);
  }
}

export const addMyselfToRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { roleId } = req.params;
  const userId = res.locals.uid;
  const serverId = res.locals.server_id;

  try {
    const { addUserToRole: members } = await graphQLClient().request(
      serverRoleMutations.ADD_USER_TO_ROLE,
      {
        role_id: roleId,
        user_id: userId,
      }
    );

    return res.status(201).json({
      server_id: serverId,
      role_id: roleId,
      members: members ? members : []
    });
  } catch (error) {
    return next(error);
  }
}

export const removeMyselfFromRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { roleId } = req.params;
  const userId = res.locals.uid;
  const serverId = res.locals.server_id;

  try {
    const { removeUserFromRole: members } = await graphQLClient().request(
      serverRoleMutations.REMOVE_USER_FROM_ROLE,
      {
        role_id: roleId,
        user_id: userId,
      }
    );

    return res.status(201).json({
      server_id: serverId,
      role_id: roleId,
      members: members ? members : []
    });
  } catch (error) {
    return next(error);
  }
}

export const getRolesAssignedWithUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  const serverId = res.locals.server_id;

  try {
    const { getRolesAssignedWithUser: roles } = await graphQLClient().request(
      serverRoleQueries.GET_ROLES_ASSIGNED_WITH_USER,
      {
        user_id: userId,
        server_id: serverId,
      }
    );

    const filteredRoles = roles.map((role: any) => ({
      id: role.id,
      name: role.name,
      color: role.color,
      position: role.position,
      is_admin: role.is_admin,
      allow_anyone_mention: role.allow_anyone_mention,
      last_modified: role.last_modified,
      number_of_users: role.number_of_users,
    }));

    return res.status(201).json({
      server_id: serverId,
      user_id: userId,
      roles: filteredRoles ? filteredRoles : []
    });
  } catch (error) {
    return next(error);
  }
}

export const getRolesAssignedWithMyself = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = res.locals.uid;
  const serverId = res.locals.server_id;

  try {
    const { getRolesAssignedWithUser: roles } = await graphQLClient().request(
      serverRoleQueries.GET_ROLES_ASSIGNED_WITH_USER,
      {
        user_id: userId,
        server_id: serverId,
      }
    );

    const filteredRoles = roles.map((role: any) => ({
      id: role.id,
      name: role.name,
      color: role.color,
      position: role.position,
      is_admin: role.is_admin,
      allow_anyone_mention: role.allow_anyone_mention,
      last_modified: role.last_modified,
      number_of_users: role.number_of_users,
    }));

    return res.status(201).json({
      server_id: serverId,
      user_id: userId,
      roles: filteredRoles ? filteredRoles : []
    });
  } catch (error) {
    return next(error);
  }
}