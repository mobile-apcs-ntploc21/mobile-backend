import express from "express";
import graphQLClient from "../../utils/graphql";

import { messageQueries } from "../../graphql/queries";
import { _getChannel } from "./channels/channel";

// ==============

const _getMessage = async (message_id: string): Promise<any> => {
  if (!message_id) {
    throw new Error("Message ID is required.");
  }

  try {
    const { message } = await graphQLClient().request(
      messageQueries.GET_MESSAGE,
      {
        message_id,
      }
    );

    return message;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ==============

export const getMessage = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { messageId: message_id } = req.params;

  try {
    const message = await _getMessage(message_id);

    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    return res.status(200).json({ message });
  } catch (error: any) {
    return next(error);
  }
};

export const getMessages = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { channelId } = req.params;
  const { limit } = req.query;
  const { before, after, around } = req.body;

  if (!channelId) {
    return res.status(400).json({ message: "Channel ID is required." });
  }

  const channel = await _getChannel(channelId).catch(() => null);
  if (!channel) {
    return res
      .status(404)
      .json({ message: "Channel not found in the server." });
  }
  if (!channel.conversation_id) {
    return res.status(404).json({
      message:
        "Channel does not have a conversation. Please delete and create a new channel.",
    });
  }

  try {
    const requestBody = {
      conversation_id: channel.conversation_id,
      limit: parseInt(limit as string) || 50,
      before: before,
      after: after,
      around: around,
    };
    const { messages } = await graphQLClient().request(
      messageQueries.GET_MESSAGES,
      requestBody
    );

    if (!messages) {
      // Return empty array if no messages found
      return res.status(200).json({ messages: [] });
    }

    return res.status(200).json({ messages });
  } catch (error: any) {
    return next(error);
  }
};

export const searchMessages = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { page, limit } = req.query;
  const {
    content,
    author_id,
    mentions,
    has,
    in: inChannel,
    conversationIds,
  } = req.query;

  if (!req.query) {
    return res.status(400).json({ message: "Query is required." });
  }

  // If conversationIds is provided, search in those conversations
  let conversationId = [];
  if (conversationIds) {
    conversationId = Array.isArray(conversationIds)
      ? conversationIds
      : [conversationIds];
  } else if (inChannel) {
    // Get conversation ID from each channel
    let channels = Array.isArray(inChannel) ? inChannel : [inChannel];
    for (let i = 0; i < channels.length; i++) {
      const channel = await _getChannel(channels[i] as string).catch(
        () => null
      );
      if (!channel) {
        return res.status(404).json({
          message: `Channel with ID ${channels[i]} not found.`,
        });
      }
      if (!channel.conversation_id) {
        return res.status(404).json({
          message: `Channel with ID ${channels[i]} does not have a conversation.`,
        });
      }
      conversationId.push(channel.conversation_id);
    }
  } else {
    // TODO: Implement global search
    return res.status(400).json({
      message:
        "Global search is not implemented. Please provide a channel ID or conversation ID.",
    });
  }

  try {
    const requestBody = {
      query: {
        text: content,
        inConversation: conversationId,
        from: author_id,
        mention: mentions,
        has: has,
      },
      offset: (parseInt(page as string) - 1) * 25 || 0,
      limit: parseInt(limit as string) || 25,
    };

    const { searchMessages: messages } = await graphQLClient().request(
      messageQueries.SEARCH_MESSAGES,
      requestBody
    );

    if (!messages) {
      // Return empty array if no messages found
      return res.status(200).json({ messages: [] });
    }

    return res.status(200).json({ messages });
  } catch (error: any) {
    return next(error);
  }
};

export const getPinnedMessages = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { channelId } = req.params;

  if (!channelId) {
    return res.status(400).json({ message: "Channel ID is required." });
  }

  const channel = await _getChannel(channelId).catch(() => null);
  if (!channel) {
    return res
      .status(404)
      .json({ message: "Channel not found in the server." });
  }
  if (!channel.conversation_id) {
    return res.status(404).json({
      message:
        "Channel does not have a conversation. Please delete and create a new channel.",
    });
  }

  try {
    const { pinnedMessages: messages } = await graphQLClient().request(
      messageQueries.GET_PINNED_MESSAGES,
      {
        conversation_id: channel.conversation_id,
      }
    );

    if (!messages) {
      // Return empty array if no pinned messages
      return res.status(200).json({ messages: [] });
    }

    return res.status(200).json({ messages });
  } catch (error: any) {
    return next(error);
  }
};
