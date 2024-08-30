import express from "express";
import graphQLClient from "../../utils/graphql";

import { serverBansQueries } from "../../graphql/queries";
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

  if (!serverId || !userId) {
    return res.status(400).json({
      message: "Missing serverId or userId",
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
  // TODO: Check user has permission to ban

  // We assume that userIds is an array of user IDs
  const { serverId } = req.params;
  const { userIds } = req.body;

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
      message: "Missing serverId or userId",
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
        message: "Ban not found",
      });
    }

    return res.status(204);
  } catch (error) {
    return next(error);
  }
};

// ==================
