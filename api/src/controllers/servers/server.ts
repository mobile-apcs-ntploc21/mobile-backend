import express from "express";

import { processImage } from "../../utils/storage";
import graphQLClient from "../../utils/graphql";
import { serverQueries } from "../../graphql/queries";
import { serverMutations } from "../../graphql/mutations";
import { log } from "@/utils/log";

import redisClient from "@/utils/redisClient";
import { SERVERS } from "@/constants/redisKey";

const getServerOverview = async (server_id: string) => {
  const cachedKey = SERVERS.SERVER_OVERVIEW.key({ server_id });

  const cachedData = await redisClient.fetch(
    cachedKey,
    async () => {
      const response = await graphQLClient().request(
        serverQueries.GET_SERVER_BY_ID,
        {
          server_id,
        }
      );

      return response.server;
    },
    SERVERS.SERVER_OVERVIEW.TTL
  );

  return cachedData;
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
    res.status(400).json({ message: "Server ID is required." });
    return;
  }

  try {
    const server = await getServerOverview(server_id).catch(() => null);

    if (!server) {
      res.status(404).json({ message: "Server not found." });
      return;
    }

    res.status(200).json({ ...server });
    return;
  } catch (error) {
    next(error);
    return;
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

    res.status(200).json({
      servers: servers,
    });
    return;
  } catch (error) {
    next(error);
    return;
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
    res.status(400).json({ message: "Name for the server is required." });
    return;
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

    res.status(201).json({ ...response.createServer });
    return;
  } catch (error) {
    next(error);
    return;
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
    res.status(400).json({ message: "Server ID is required." });
    return;
  }

  // TODO: Check user permissions

  try {
    const input: { name?: string; avatar_url?: string; banner_url?: string } = {
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

    // Write new data to cache
    const cachedKey = SERVERS.SERVER_OVERVIEW.key({ server_id });
    await redisClient.write(
      cachedKey,
      JSON.stringify(response.updateServer),
      SERVERS.SERVER_OVERVIEW.TTL
    );

    res.status(200).json({ ...response.updateServer });
    return;
  } catch (error) {
    next(error);
    return;
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
    res.status(400).json({ message: "Server ID is required." });
    return;
  }

  const server = await getServerOverview(serverId).catch(() => null);
  if (!server) {
    res.status(404).json({ message: "Server not found." });
    return;
  }

  if (server.owner !== res.locals.uid) {
    res
      .status(403)
      .json({ message: "You don't have permission to delete this server." });
    return;
  }

  try {
    const response = await graphQLClient(user_token).request(
      serverMutations.DELETE_SERVER,
      {
        server_id: serverId,
      }
    );

    // Clear cache for server overview and members
    let cachedKey = SERVERS.SERVER_OVERVIEW.key({ server_id: serverId });
    await redisClient.delete(cachedKey);
    cachedKey = SERVERS.SERVER_MEMBERS.key({ server_id: serverId });
    await redisClient.delete(cachedKey);

    res.status(200).json({ message: "Server deleted successfully" });
    return;
  } catch (error) {
    next(error);
    return;
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
    res.status(400).json({ message: "Server ID and User ID are required." });
    return;
  }

  if (user_id === res.locals.uid) {
    res
      .status(400)
      .json({ message: "You can't transfer ownership to yourself." });
    return;
  }

  try {
    const response = await graphQLClient(user_token).request(
      serverMutations.TRANSFER_OWNERSHIP,
      {
        server_id: server_id,
        user_id: user_id,
      }
    );

    // Clear cache for server getServerOverview
    const cachedKey = SERVERS.SERVER_OVERVIEW.key({ server_id });
    await redisClient.delete(cachedKey);

    res.status(200).json({ message: "Ownership transferred successfully" });
    return;
  } catch (error) {
    next(error);
    return;
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
    res.status(400).json({ message: "Server ID is required." });
    return;
  }

  try {
    const cacheKey = SERVERS.SERVER_INVITE_CODES.key({ server_id });

    const cachedData = await redisClient.fetch(
      cacheKey,
      async () => {
        const response = await graphQLClient(user_token).request(
          serverQueries.GET_INVITE_CODE,
          {
            server_id: server_id,
          }
        );

        return response.getInviteCode;
      },
      SERVERS.SERVER_INVITE_CODES.TTL
    );

    res.status(200).json({ ...cachedData });
    return;
  } catch (error) {
    next(error);
    return;
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
    res.status(400).json({ message: "Server ID is required." });
    return;
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

    // Clear cache for invite codes
    const cacheKey = SERVERS.SERVER_INVITE_CODES.key({ server_id });
    await redisClient.delete(cacheKey);

    res.status(201).json({ ...response.createInviteCode });
    return;
  } catch (error) {
    next(error);
    return;
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
    res.status(400).json({ message: "Server ID and URL are required." });
    return;
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

    // Clear cache for invite codes
    const cacheKey = SERVERS.SERVER_INVITE_CODES.key({ server_id });
    await redisClient.delete(cacheKey);

    res.status(200).json({ message: "Invite code deleted successfully" });
    return;
  } catch (error) {
    next(error);
    return;
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
    res.status(400).json({ message: "Servers are required." });
    return;
  }

  if (!user_id) {
    res.status(400).json({ message: "User ID is required." });
    return;
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
      res.status(400).json({ message: "Failed to move servers." });
      return;
    }

    res.status(200).json({ message: "Servers moved successfully" });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const setFavoriteServer = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  log.info("setFavoriteServer");
  const is_favorite = req.body?.is_favorite ?? undefined;
  const server_id = req.params?.serverId;
  const user_id = res.locals.uid;

  if (!server_id) {
    res
      .status(400)
      .json({ message: "Server ID and is_favorite are required." });
    return;
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
      res.status(400).json({ message: "Failed to update favorite." });
      return;
    }

    res.status(200).json({ message: "Server favorite updated" });
    return;
  } catch (error) {
    next(error);
    return;
  }
};
