import express from "express";
import streamifier from "streamifier";

import { processImage } from "../utils/storage";
import graphQLClient from "../utils/graphql";
import { serverQueries } from "../graphql/queries";
import { serverMutations } from "../graphql/mutations";

const getServerOverview = async (serverId: string) => {
  const response = await graphQLClient().request(
    serverQueries.GET_SERVER_BY_ID,
    {
      server_id: serverId,
    }
  );

  return response.getServerById;
};

const getServersByUserId = async (userId: string) => {
  const response = await graphQLClient().request(
    serverQueries.GET_SERVERS_BY_USER_ID,
    {
      user_id: userId,
    }
  );

  return response.getServersByUserId;
};

// ============================

export const getServer = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const serverId = req.params?.serverId as string;

  if (!serverId) {
    return res.status(400).json({ message: "Server ID is required." });
  }

  try {
    const server = await getServerOverview(serverId).catch(() => null);

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
  const userId = req.params?.userId as string;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    const servers = await getServersByUserId(userId).catch(() => null);

    if (!servers) {
      return res.status(404).json({ message: "Servers not found." });
    }

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
  const { name, image, banner } = req.body;
  const user_id = res.locals.uid;

  if (!name) {
    return res
      .status(400)
      .json({ message: "Name for the server is required." });
  }

  try {
    let image_url = null;
    let banner_url = null;

    if (image) {
      const buffer = await streamifier.toBuffer(image);
      image_url = await processImage(buffer, "servers");
    }

    if (banner) {
      const buffer = await streamifier.toBuffer(banner);
      banner_url = await processImage(buffer, "servers");
    }

    const response = await graphQLClient().request(
      serverMutations.CREATE_SERVER,
      {
        name,
        owner_id: user_id,
        image_url: image_url,
        banner_url: banner_url,
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
  const { name, image, banner } = req.body;

  if (!server_id) {
    return res.status(400).json({ message: "Server ID is required." });
  }

  try {
    let image_url = null;
    let banner_url = null;

    if (image) {
      const buffer = await streamifier.toBuffer(image);
      image_url = await processImage(buffer, "servers");
    }

    if (banner) {
      const buffer = await streamifier.toBuffer(banner);
      banner_url = await processImage(buffer, "servers");
    }

    const response = await graphQLClient(user_token).request(
      serverMutations.UPDATE_SERVER,
      {
        server_id: server_id,
        input: {
          name,
          image_url,
          banner_url,
        },
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

  try {
    const response = await graphQLClient(user_token).request(
      serverMutations.DELETE_SERVER,
      {
        server_id: serverId,
      }
    );

    return res.status(200).json({ ...response.deleteServer });
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
  const user_id = req.params?.userId as string;
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

    return res.status(200).json({ ...response.transferOwnership });
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
  const { expiredAt, maxUses } = req.body;
  let url = null;

  if (!server_id) {
    return res.status(400).json({ message: "Server ID is required." });
  }

  // Generate a random URL
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < 10; i++) {
    url += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

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

  try {
    const response = await graphQLClient(user_token).request(
      serverMutations.DELETE_INVITE_CODE,
      {
        server_id: server_id,
        url: url,
      }
    );

    return res.status(200).json({ ...response.deleteInviteCode });
  } catch (error) {
    return next(error);
  }
};
