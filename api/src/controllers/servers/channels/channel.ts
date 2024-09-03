import express from "express";

import graphQLClient from "../../../utils/graphql";
import { serverChannelQueries } from "../../../graphql/queries";
import { channelMutations } from "../../../graphql/mutations";

const _getChannel = async (channel_id: string) => {
  try {
    const response = await graphQLClient().request(
      serverChannelQueries.GET_CHANNEL,
      {
        channel_id,
      }
    );

    return response.getChannel;
  } catch (error) {
    return null;
  }
};

const _getChannels = async (server_id: string) => {
  try {
    const response = await graphQLClient().request(
      serverChannelQueries.GET_CHANNELS,
      {
        server_id,
      }
    );

    // Convert into array of channels and sort by position
    const channels = response.getChannels.map((channel: any) => {
      return channel;
    });

    return channels.sort((a: any, b: any) => a.position - b.position);
  } catch (error) {
    return null;
  }
};

// ============================

export const getChannel = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const server_id = res.locals.server_id;
  const channel_id = req.params?.channelId;

  if (!server_id) {
    return res.status(400).json({ message: "Server ID is required." });
  }
  if (!channel_id) {
    return res.status(400).json({ message: "Channel ID is required." });
  }

  try {
    const channel = await _getChannel(channel_id).catch(() => null);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found." });
    }

    return res.status(200).json({ ...channel });
  } catch (error) {
    return next(error);
  }
};

export const getChannels = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const server_id = res.locals.server_id;

  if (!server_id) {
    return res.status(400).json({ message: "Server ID is required." });
  }

  try {
    const channels = await _getChannels(server_id).catch(() => null);

    return res.status(200).json({ channels });
  } catch (error) {
    return next(error);
  }
};

export const createChannel = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const server_id = res.locals.server_id;
  const { name, category_id } = req.body;

  if (!server_id || !name) {
    return res.status(400).json({ message: "Server ID and name is required." });
  }

  try {
    const channel = await graphQLClient().request(
      channelMutations.CREATE_CHANNEL,
      {
        server_id,
        input: {
          name,
          category_id,
        },
      }
    );

    return res.status(200).json({ ...channel.createChannel });
  } catch (error) {
    return next(error);
  }
};

export const updateChannel = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const server_id = res.locals.server_id;
  const channel_id = req.params?.channelId;
  const { name, description, is_nsfw, is_archived, is_deleted } = req.body;

  if (!server_id) {
    return res.status(400).json({ message: "Server ID is required." });
  }

  if (!channel_id) {
    return res.status(400).json({ message: "Channel ID is required." });
  }

  const channel = await _getChannel(channel_id).catch(() => null);
  if (!channel || channel.server_id !== server_id) {
    return res.status(404).json({ message: "Channel not found." });
  }

  try {
    const channel = await graphQLClient().request(
      channelMutations.UPDATE_CHANNEL,
      {
        channel_id,
        input: {
          name,
          description,
          is_nsfw,
          is_archived,
          is_deleted,
        },
      }
    );

    return res.status(200).json({ ...channel.updateChannel });
  } catch (error) {
    return next(error);
  }
};

export const deleteChannel = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const server_id = res.locals.server_id;
  const channel_id = req.params?.channelId;

  if (!server_id) {
    return res.status(400).json({ message: "Server ID is required." });
  }

  if (!channel_id) {
    return res.status(400).json({ message: "Channel ID is required." });
  }

  const channel = await _getChannel(channel_id).catch(() => null);
  if (!channel || channel.server_id !== server_id) {
    return res.status(404).json({ message: "Channel not found." });
  }

  try {
    await graphQLClient().request(channelMutations.DELETE_CHANNEL, {
      channel_id,
    });

    return res.status(200).json({ message: "Channel deleted." });
  } catch (error) {
    return next(error);
  }
};

export const hardDeleteChannel = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const channel_id = req.params?.channelId;

  if (!channel_id) {
    return res.status(400).json({ message: "Channel ID is required." });
  }

  try {
    await graphQLClient().request(channelMutations.HARD_DELETE_CHANNEL, {
      channel_id,
    });

    return res.status(200).json({ message: "Channel hard deleted." });
  } catch (error) {
    return next(error);
  }
};

export const moveChannel = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const server_id = res.locals.server_id;
  const channel_id = req.params?.channelId;
  const { category_id, new_position } = req.body;

  if (!server_id) {
    return res.status(400).json({ message: "Server ID is required." });
  }

  if (!channel_id) {
    return res.status(400).json({ message: "Channel ID is required." });
  }

  if (new_position === undefined) {
    return res.status(400).json({ message: "New position is required." });
  }

  const channel = await _getChannel(channel_id).catch(() => null);
  if (!channel || channel.server_id !== server_id) {
    return res.status(404).json({ message: "Channel not found." });
  }

  try {
    const channel = await graphQLClient().request(
      channelMutations.MOVE_CHANNEL,
      {
        channel_id,
        category_id,
        new_position,
      }
    );

    return res.status(200).json({ ...channel.moveChannel });
  } catch (error) {
    return next(error);
  }
};
