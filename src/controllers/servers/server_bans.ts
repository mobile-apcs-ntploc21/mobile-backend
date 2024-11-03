import express from "express";
import graphQLClient from "../../utils/graphql";

import {
  serverBansQueries,
  serverRoleQueries,
  serverQueries,
} from "../../graphql/queries";
import { serverBansMutations } from "../../graphql/mutations";

const _getServerBan = async (serverId: string, userId: string) => {
  const response = await graphQLClient().request(
    serverBansQueries.GET_SERVER_BAN,
    {
      server_id: serverId,
      user_id: userId,
    }
  );

  return response.getServerBan;
};

const _getServerBans = async (serverId: string, limit: number) => {
  const response = await graphQLClient().request(
    serverBansQueries.GET_SERVER_BANS,
    {
      server_id: serverId,
      limit: limit,
    }
  );

  return response.getServerBans;
};

const getUserRoles = async (serverId: string, userId: string) => {
  const response = await graphQLClient().request(
    serverRoleQueries.GET_ROLES_ASSIGNED_WITH_USER,
    {
      user_id: userId,
      server_id: serverId,
    }
  );

  return response.getRolesAssignedWithUser;
};

const isUserOwner = async (serverId: string, userId: string) => {
  const response = await graphQLClient().request(
    serverQueries.GET_SERVER_BY_ID,
    {
      server_id: serverId,
    }
  );

  return String(response.server.owner) === String(userId);
};

// ==================

/**
 * Check if the user has the permission to ban or kick a user from the server
 * It will check these condition:
 * - If the userId is the owner of the server = return false
 * - If the userId has Administration role and currentUserId is not owner = return false
 *
 * @async
 * @param {string} serverId
 * @param {string} userId
 * @param {string} currentUserId
 * @returns {*}
 */
const checkPrequisites = async (
  serverId: string,
  userId: string,
  currentUserId: string
) => {
  if (userId === currentUserId) {
    return "Cannot ban or kick yourself";
  }

  const isOwner = await isUserOwner(serverId, userId);
  if (isOwner) {
    return "Cannot ban the server owner";
  }

  const currentUserOwner = await isUserOwner(serverId, currentUserId);
  const userRoles = await getUserRoles(serverId, currentUserId);
  const isAdmin = userRoles.find((role: any) => role.is_admin);

  if (isAdmin && !currentUserOwner) {
    return "You don't have permission to ban or kick user";
  }

  return null;
};

// ==================

export const getServerBan = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { serverId, userId } = req.params;

  if (!serverId || !userId) {
    res.status(400).json({
      message: "Missing serverId or userId",
    });
    return;
  }

  try {
    const serverBan = await _getServerBan(serverId, userId);

    if (!serverBan) {
      res.status(404).json({
        message: "Ban not found",
      });
      return;
    }

    res.status(200).json(serverBan);
    return;
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
    return;
  }
};

export const getServerBans = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { serverId } = req.params;
  const { limit } = req.query;

  if (!serverId) {
    res.status(400).json({
      message: "Missing serverId",
    });
    return;
  }

  try {
    const serverBans = await _getServerBans(serverId, Number(limit) || 1000);
    res.status(200).json(serverBans);
    return;
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
    return;
  }
};

export const createServerBan = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { serverId, userId } = req.params;
  const currentUser = res.locals.uid;

  if (!serverId || !userId) {
    res.status(400).json({
      message: "Missing serverId or userId in the params",
    });
    return;
  }

  const check = await checkPrequisites(serverId, userId, currentUser);
  if (check) {
    res.status(403).json({
      message: check,
    });
    return;
  }

  try {
    const response = await graphQLClient().request(
      serverBansMutations.CREATE_SERVER_BAN,
      {
        server_id: serverId,
        user_id: userId,
      }
    );

    res.status(200).json(response.createServerBan);
    return;
  } catch (error: any) {
    const errorMessage = String(error.response.errors[0].message) ?? null;
    if (!errorMessage) {
      next(error);
      return;
    }
    res.status(400).json({
      message: errorMessage,
    });
    return;
  }
};

export const createServerBulkBan = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  // We assume that userIds is an array of user IDs
  const { serverId } = req.params;
  const { userIds } = req.body;
  const currentUser = res.locals.uid;

  if (!serverId || !userIds) {
    res.status(400).json({
      message: "Missing serverId or userIds field",
    });
    return;
  }

  // Check if userIds is an array
  if (!Array.isArray(userIds)) {
    res.status(400).json({
      message: "User IDs must be an array. I.e. userIds: ['id1', 'id2'].",
    });
    return;
  }

  for (let i = 0; i < userIds.length; i++) {
    const check = await checkPrequisites(serverId, userIds[i], currentUser);
    if (check) {
      res.status(403).json({
        failed: userIds[i],
        message: check,
      });
      return;
    }
  }

  try {
    const response = await graphQLClient().request(
      serverBansMutations.CREATE_SERVER_BULK_BAN,
      {
        server_id: serverId,
        user_ids: userIds,
      }
    );

    res.status(200).json(response.createServerBulkBan);
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const deleteServerBan = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { serverId, userId } = req.params;

  if (!serverId || !userId) {
    res.status(400).json({
      message: "Missing serverId or userId in the params",
    });
    return;
  }

  try {
    const response = await graphQLClient().request(
      serverBansMutations.DELETE_SERVER_BAN,
      {
        server_id: serverId,
        user_id: userId,
      }
    );

    if (!response.deleteServerBan) {
      res.status(404).json({
        message: "Banned user information not found",
      });
      return;
    }

    res.status(204).send();
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const createServerKick = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { serverId, userId } = req.params;

  if (!serverId || !userId) {
    res.status(400).json({
      message: "Missing serverId or userId in the params",
    });
    return;
  }

  const check = await checkPrequisites(serverId, userId, res.locals.uid);
  if (check) {
    res.status(403).json({
      message: check,
    });
    return;
  }

  try {
    const response = (
      await graphQLClient().request(serverBansMutations.CREATE_SERVER_KICK, {
        server_id: serverId,
        user_id: userId,
      })
    )?.createServerKick;

    if (!response) {
      res.status(404).json({
        message: "User not found or cannot be kick.",
      });
      return;
    }

    res.status(204).send();
    return;
  } catch (error) {
    next(error);
    return;
  }
};

// ==================
