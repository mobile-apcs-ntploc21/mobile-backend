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
  const isAdmin = userRoles.find((role) => role.is_admin);

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
    return res.status(400).json({
      message: "Missing serverId or userId",
    });
  }

  try {
    const serverBan = await _getServerBan(serverId, userId);

    if (!serverBan) {
      return res.status(404).json({
        message: "Ban not found",
      });
    }

    return res.status(200).json(serverBan);
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
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
    return res.status(400).json({
      message: "Missing serverId",
    });
  }

  try {
    const serverBans = await _getServerBans(serverId, Number(limit) || 1000);
    return res.status(200).json(serverBans);
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
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
    return res.status(400).json({
      message: "Missing serverId or userId in the params",
    });
  }

  const check = await checkPrequisites(serverId, userId, currentUser);
  if (check) {
    return res.status(403).json({
      message: check,
    });
  }

  try {
    const response = await graphQLClient().request(
      serverBansMutations.CREATE_SERVER_BAN,
      {
        server_id: serverId,
        user_id: userId,
      }
    );

    return res.status(200).json(response.createServerBan);
  } catch (error) {
    const errorMessage = String(error.response.errors[0].message) ?? null;
    if (!errorMessage) {
      return next(error);
    }
    return res.status(400).json({
      message: errorMessage,
    });
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
    return res.status(400).json({
      message: "Missing serverId or userIds field",
    });
  }

  // Check if userIds is an array
  if (!Array.isArray(userIds)) {
    return res.status(400).json({
      message: "User IDs must be an array. I.e. userIds: ['id1', 'id2'].",
    });
  }

  for (let i = 0; i < userIds.length; i++) {
    const check = await checkPrequisites(serverId, userIds[i], currentUser);
    if (check) {
      return res.status(403).json({
        failed: userIds[i],
        message: check,
      });
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

    return res.status(200).json(response.createServerBulkBan);
  } catch (error) {
    return next(error);
  }
};

export const deleteServerBan = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { serverId, userId } = req.params;

  if (!serverId || !userId) {
    return res.status(400).json({
      message: "Missing serverId or userId in the params",
    });
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
      return res.status(404).json({
        message: "Banned user information not found",
      });
    }

    return res.status(204);
  } catch (error) {
    return next(error);
  }
};

export const createServerKick = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { serverId, userId } = req.params;

  if (!serverId || !userId) {
    return res.status(400).json({
      message: "Missing serverId or userId in the params",
    });
  }

  const check = await checkPrequisites(serverId, userId, res.locals.uid);
  if (check) {
    return res.status(403).json({
      message: check,
    });
  }

  try {
    const response = (
      await graphQLClient().request(serverBansMutations.CREATE_SERVER_KICK, {
        server_id: serverId,
        user_id: userId,
      })
    )?.createServerKick;

    if (!response) {
      return res.status(404).json({
        message: "User not found or cannot be kick.",
      });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

// ==================
