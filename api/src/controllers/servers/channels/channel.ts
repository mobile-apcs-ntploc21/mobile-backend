import express from "express";

import graphQLClient from "@/utils/graphql";
import { serverChannelQueries } from "@/graphql/queries";
import { channelMutations } from "@/graphql/mutations";

export const _getChannel = async (channel_id: string) => {
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

const _getChannels = async (server_id: string, user_id?: string) => {
  try {
    const response = await graphQLClient().request(
      serverChannelQueries.GET_CHANNELS,
      {
        server_id,
        user_id,
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
    res.status(400).json({ message: "Server ID is required." });
    return;
  }
  if (!channel_id) {
    res.status(400).json({ message: "Channel ID is required." });
    return;
  }

  try {
    const channel = await _getChannel(channel_id).catch(() => null);

    if (!channel) {
      res.status(404).json({ message: "Channel not found." });
      return;
    }

    res.status(200).json({ ...channel });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const getChannels = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const server_id = res.locals.server_id;
  const user_id = res.locals.uid ?? null;

  if (!server_id) {
    res.status(400).json({ message: "Server ID is required." });
    return;
  }

  try {
    const channels = await _getChannels(server_id, user_id).catch(() => null);

    res.status(200).json({ channels });
    return;
  } catch (error) {
    next(error);
    return;
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
    res.status(400).json({ message: "Server ID and name is required." });
    return;
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

    res.status(200).json({ ...channel.createChannel });
    return;
  } catch (error) {
    next(error);
    return;
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
    res.status(400).json({ message: "Server ID is required." });
    return;
  }

  if (!channel_id) {
    res.status(400).json({ message: "Channel ID is required." });
    return;
  }

  const channel = await _getChannel(channel_id).catch(() => null);
  if (!channel || channel.server_id !== server_id) {
    res.status(404).json({ message: "Channel not found." });
    return;
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

    res.status(200).json({ ...channel.updateChannel });
    return;
  } catch (error) {
    next(error);
    return;
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
    res.status(400).json({ message: "Server ID is required." });
    return;
  }

  if (!channel_id) {
    res.status(400).json({ message: "Channel ID is required." });
    return;
  }

  const channel = await _getChannel(channel_id).catch(() => null);
  if (!channel || channel.server_id !== server_id) {
    res.status(404).json({ message: "Channel not found." });
    return;
  }

  try {
    await graphQLClient().request(channelMutations.DELETE_CHANNEL, {
      channel_id,
    });

    res.status(200).json({ message: "Channel deleted." });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const hardDeleteChannel = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const channel_id = req.params?.channelId;

  if (!channel_id) {
    res.status(400).json({ message: "Channel ID is required." });
    return;
  }

  try {
    await graphQLClient().request(channelMutations.HARD_DELETE_CHANNEL, {
      channel_id,
    });

    res.status(200).json({ message: "Channel hard deleted." });
    return;
  } catch (error) {
    next(error);
    return;
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
    res.status(400).json({ message: "Server ID is required." });
    return;
  }

  if (!channel_id) {
    res.status(400).json({ message: "Channel ID is required." });
    return;
  }

  if (new_position === undefined) {
    res.status(400).json({ message: "New position is required." });
    return;
  }

  const channel = await _getChannel(channel_id).catch(() => null);
  if (!channel || channel.server_id !== server_id) {
    res.status(404).json({ message: "Channel not found." });
    return;
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

    res.status(200).json({ ...channel.moveChannel });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const moveAllChannel = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const server_id = res.locals.server_id;
  const { channels } = req.body;

  if (!server_id) {
    res.status(400).json({ message: "Server ID is required." });
    return;
  }

  if (!channels) {
    res.status(400).json({
      message:
        "An input of array of channels is required. Eg., channels: [channel_id, category_id, position]",
    });
    return;
  }

  if (!Array.isArray(channels)) {
    res
      .status(400)
      .json({ message: "Input of array of channels must be an array." });
    return;
  }

  try {
    const response = await graphQLClient().request(
      channelMutations.MOVE_ALL_CHANNEL,
      {
        server_id,
        input: channels,
      }
    );

    res.status(200).json({ ...response.moveAllChannel });
    return;
  } catch (error) {
    next(error);
    return;
  }
};
