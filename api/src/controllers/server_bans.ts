import express from "express";
import graphQLClient from "../utils/graphql";

import { serverBansQueries } from "../graphql/queries";
import { serverBansMutations } from "../graphql/mutations";

const _getServerBan = async (server_id: string, user_id: string) => {
  const response = await graphQLClient().request(
    serverBansQueries.GET_SERVER_BAN,
    {
      server_id,
      user_id,
    }
  );

  return response.getServerBan;
};

const _getServerBans = async (server_id: string, limit: number) => {
  const response = await graphQLClient().request(
    serverBansQueries.GET_SERVER_BANS,
    {
      server_id,
      limit,
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
  // TODO: Check user has permission to view ban

  const { server_id, user_id } = req.params;

  if (!server_id || !user_id) {
    return res.status(400).json({
      message: "Missing server_id or user_id",
    });
  }

  try {
    const serverBan = await _getServerBan(server_id, user_id);
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
  // TODO: Check user has permission to view bans

  const { server_id } = req.params;
  const { limit } = req.query;

  if (!server_id) {
    return res.status(400).json({
      message: "Missing server_id",
    });
  }

  try {
    const serverBans = await _getServerBans(server_id, Number(limit) || 1000);
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
  // TODO: Check user has permission to ban

  const { server_id, user_id } = req.body;

  if (!server_id || !user_id) {
    return res.status(400).json({
      message: "Missing server_id or user_id",
    });
  }

  try {
    const response = await graphQLClient().request(
      serverBansMutations.CREATE_SERVER_BAN,
      {
        server_id: server_id,
        user_id: user_id,
      }
    );

    return res.status(200).json(response.createServerBan);
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const createServerBulkBan = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  // TODO: Check user has permission to ban

  // We assume that user_ids is an array of user IDs
  const { server_id, user_ids } = req.body;

  if (!server_id || !user_ids) {
    return res.status(400).json({
      message: "Missing server_id or user_ids field",
    });
  }

  // Check if user_ids is an array
  if (!Array.isArray(user_ids)) {
    return res.status(400).json({
      message: "User IDs must be an array. I.e. user_ids: ['id1', 'id2'].",
    });
  }

  try {
    const response = await graphQLClient().request(
      serverBansMutations.CREATE_SERVER_BULK_BAN,
      {
        server_id: server_id,
        user_ids: user_ids,
      }
    );

    return res.status(200).json(response.createServerBulkBan);
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const deleteServerBan = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { server_id, user_id } = req.body;

  if (!server_id || !user_id) {
    return res.status(400).json({
      message: "Missing server_id or user_id",
    });
  }

  try {
    const response = await graphQLClient().request(
      serverBansMutations.DELETE_SERVER_BAN,
      {
        server_id: server_id,
        user_id: user_id,
      }
    );

    return res.status(200).json(response.deleteServerBan);
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// ==================
