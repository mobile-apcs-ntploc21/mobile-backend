import express from "express";

import graphQLClient from "../utils/graphql";
import { channelQueries } from "@/graphql/queries";

const _getChannel = async (channel_id: string) => {
  try {
    const response = await graphQLClient().request(channelQueries.GET_CHANNEL, {
      channel_id,
    });

    return response.channel;
  } catch (error) {
    return null;
  }
};

const _getChannels = async (server_id: string) => {
  try {
    const response = await graphQLClient().request(
      channelQueries.GET_CHANNELS,
      {
        server_id,
      }
    );

    // Convert into array of channels and sort by position
    const channels = response.channels.map((channel: any) => {
      return channel;
    });

    return channels.sort((a: any, b: any) => a.position - b.position);
  } catch (error) {
    return null;
  }
};

const _getChannelPermissions = async (channel_id: string) => {
  try {
    const response = await graphQLClient().request(
      channelQueries.GET_CHANNEL_PERMISSIONS,
      {
        channel_id,
      }
    );

    return response.channelPermission;
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
  const channel_id = req.params?.channelId;

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
  const server_id = req.params?.serverId;

  if (!server_id) {
    return res.status(400).json({ message: "Server ID is required." });
  }

  try {
    const channels = await _getChannels(server_id).catch(() => null);

    if (!channels) {
      return res.status(404).json({ message: "Channels not found." });
    }

    return res.status(200).json({ channels });
  } catch (error) {
    return next(error);
  }
};

export const getChannelPermissions = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const channel_id = req.params?.channelId;

  if (!channel_id) {
    return res.status(400).json({ message: "Channel ID is required." });
  }

  try {
    const permissions = await _getChannelPermissions(channel_id).catch(
      () => null
    );

    if (!permissions) {
      return res
        .status(404)
        .json({ message: "Channel permissions not found." });
    }

    return res.status(200).json({ permissions });
  } catch (error) {
    return next(error);
  }
};
