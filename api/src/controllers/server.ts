import express from "express";
import streamifier from "streamifier";

import { processImage } from "../utils/storage";
import graphQLClient from "../utils/graphql";
import { serverQueries } from "../graphql/queries";
import { serverMutations } from "../graphql/mutations";

const getServerOverview = async (server_id: string) => {
  const response = await graphQLClient().request(
    serverQueries.GET_SERVER_BY_ID,
    {
      server_id,
    }
  );

  return response.server;
};

const getServersByUserId = async (userId: string) => {
  const response = await graphQLClient().request(
    serverQueries.GET_SERVERS_BY_USER_ID,
    {
      user_id: userId,
    }
  );

  return response.servers;
};

// ============================

export const getServer = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const server_id = req.params?.serverId as string;

  if (!server_id) {
    return res.status(400).json({ message: "Server ID is required." });
  }

  try {
    const server = await getServerOverview(server_id).catch(() => null);

    if (!server) {
      return res.status(404).json({ message: "Server not found." });
    }

    return res.status(200).json({ ...server });
  } catch (error) {
    return next(error);
  }
};

export const getUserServers = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const user_id = res.locals.uid as string;

  try {
    const servers = await getServersByUserId(user_id).catch(() => null);

    // Sort servers by position
    servers.sort((a: any, b: any) => a.position - b.position);

    // Indexing the position
    servers.forEach((server: any, index: number) => {
      server.position = index;
    });

    return res.status(200).json({ ...servers });
  } catch (error) {
    return next(error);
  }
};

export const createServer = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { name, avatar, banner } = req.body;
  const user_id = res.locals.uid;

  if (!name) {
    return res
      .status(400)
      .json({ message: "Name for the server is required." });
  }

  try {
    let avatar_url = null;
    let banner_url = null;

    if (avatar) {
      avatar_url = await processImage(avatar, "servers");
    }

    if (banner) {
      banner_url = await processImage(banner, "servers");
    }

    const response = await graphQLClient().request(
      serverMutations.CREATE_SERVER,
      {
        input: {
          name,
          owner_id: user_id,
          avatar_url: avatar_url,
          banner_url: banner_url,
        },
      }
    );

    return res.status(201).json({ ...response.createServer });
  } catch (error) {
    return next(error);
  }
};

export const updateServer = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const server_id = req.params?.serverId as string;
  const user_token = res.locals.token;
  const { name, avatar, banner } = req.body;

  if (!server_id) {
    return res.status(400).json({ message: "Server ID is required." });
  }

  // TODO: Check user permissions

  try {
    let input: { name?: string; avatar_url?: string; banner_url?: string } = {
      ...(name && { name }),
      ...(avatar && { avatar_url: await processImage(avatar, "avatars") }),
      ...(banner && { banner_url: await processImage(banner, "banners") }),
    };

    const response = await graphQLClient(user_token).request(
      serverMutations.UPDATE_SERVER,
      {
        server_id: server_id,
        input: input,
      }
    );

    return res.status(200).json({ ...response.updateServer });
  } catch (error) {
    return next(error);
  }
};

export const deleteServer = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const serverId = req.params?.serverId as string;
  const user_token = res.locals.token;

  if (!serverId) {
    return res.status(400).json({ message: "Server ID is required." });
  }

  const server = await getServerOverview(serverId).catch(() => null);
  if (!server) {
    return res.status(404).json({ message: "Server not found." });
  }

  if (server.owner !== res.locals.uid) {
    return res
      .status(403)
      .json({ message: "You don't have permission to delete this server." });
  }

  try {
    const response = await graphQLClient(user_token).request(
      serverMutations.DELETE_SERVER,
      {
        server_id: serverId,
      }
    );

    return res.status(200).json({ message: "Server deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

export const transferOwnership = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const server_id = req.params?.serverId as string;
  const { user_id } = req.body;
  const user_token = res.locals.token;

  if (!server_id || !user_id) {
    return res
      .status(400)
      .json({ message: "Server ID and User ID are required." });
  }

  if (user_id === res.locals.uid) {
    return res
      .status(400)
      .json({ message: "You can't transfer ownership to yourself." });
  }

  try {
    const response = await graphQLClient(user_token).request(
      serverMutations.TRANSFER_OWNERSHIP,
      {
        server_id: server_id,
        user_id: user_id,
      }
    );

    return res
      .status(200)
      .json({ message: "Ownership transferred successfully" });
  } catch (error) {
    return next(error);
  }
};

export const getInviteCode = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const server_id = req.params?.serverId as string;
  const user_token = res.locals.token;

  if (!server_id) {
    return res.status(400).json({ message: "Server ID is required." });
  }

  try {
    const response = await graphQLClient(user_token).request(
      serverQueries.GET_INVITE_CODE,
      {
        server_id: server_id,
      }
    );

    return res.status(200).json({ ...response.getInviteCode });
  } catch (error) {
    return next(error);
  }
};

export const createInviteCode = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const server_id = req.params?.serverId as string;
  const user_token = res.locals.token;
  const { customUrl, expiredAt, maxUses } = req.body;
  let url = null;

  if (!server_id) {
    return res.status(400).json({ message: "Server ID is required." });
  }

  // TODO: Generate a random URL
  if (customUrl) {
    url = `https://fbi.com/invite/${customUrl}`;
  } else {
    const base =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    url = "https://fbi.com/invite/";
    for (let i = 0; i < 10; i++) {
      url += base.charAt(Math.floor(Math.random() * base.length));
    }
  }

  // TODO: Check user permissions

  try {
    const response = await graphQLClient(user_token).request(
      serverMutations.CREATE_INVITE_CODE,
      {
        server_id: server_id,
        input: {
          url,
          expiredAt,
          maxUses,
        },
      }
    );

    return res.status(201).json({ ...response.createInviteCode });
  } catch (error) {
    return next(error);
  }
};

export const deleteInviteCode = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const server_id = req.params?.serverId as string;
  const user_token = res.locals.token;
  const { url } = req.body;

  if (!server_id || !url) {
    return res.status(400).json({ message: "Server ID and URL are required." });
  }

  // TODO: Check user permissions

  try {
    const response = await graphQLClient(user_token).request(
      serverMutations.DELETE_INVITE_CODE,
      {
        server_id: server_id,
        url: url,
      }
    );

    return res
      .status(200)
      .json({ message: "Invite code deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

export const moveServer = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  // Get array of servers { server_id, position }
  const { servers } = req.body;
  const user_id = res.locals.uid;

  if (!servers) {
    return res.status(400).json({ message: "Servers are required." });
  }

  if (!user_id) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    const response = await graphQLClient().request(
      serverMutations.MOVE_SERVER,
      {
        user_id: user_id,
        input: servers,
      }
    );

    if (!response) {
      return res.status(400).json({ message: "Failed to move servers." });
    }

    return res.status(200).json({ message: "Servers moved successfully" });
  } catch (error) {
    return next(error);
  }
};

export const setFavoriteServer = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  console.log("setFavoriteServer");
  const is_favorite = req.body?.is_favorite ?? undefined;
  const server_id = req.params?.serverId;
  const user_id = res.locals.uid;

  if (!server_id) {
    return res
      .status(400)
      .json({ message: "Server ID and is_favorite are required." });
  }

  try {
    const input: {
      user_id: string;
      server_id: string;
      is_favorite?: boolean;
    } = {
      user_id,
      server_id,
    };

    if (is_favorite !== undefined) {
      input.is_favorite = is_favorite;
    }

    const response = await graphQLClient().request(
      serverMutations.SET_FAVORITE_SERVER,
      input
    );

    if (!response) {
      return res.status(400).json({ message: "Failed to update favorite." });
    }

    return res.status(200).json({ message: "Server favorite updated" });
  } catch (error) {
    return next(error);
  }
};
