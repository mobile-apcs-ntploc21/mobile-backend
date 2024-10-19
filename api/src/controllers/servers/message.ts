import express from "express";
import graphQLClient from "../../utils/graphql";
import { messageQueries } from "../../graphql/queries";
import { messageMutations } from "../../graphql/mutations";

// ==============

const user_regex = /<@!?([a-f0-9]{24})>/g;
const role_regex = /<@&([a-f0-9]{24})>/g;
const channel_regex = /<#([a-f0-9]{24})>/g;
const emoji_regex = /<:(.*?):([a-f0-9]{24})>/g;

function getMatches(string: string, regex: RegExp, index: number) {
  const matches = [];
  let match;
  while ((match = regex.exec(string))) {
    matches.push(match[index]);
  }
  return matches;
}

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

const _getReactions = async (message_id: string): Promise<any> => {
  if (!message_id) {
    throw new Error("Message ID is required.");
  }

  try {
    const { reactions } = await graphQLClient().request(
      messageQueries.GET_REACTIONS,
      {
        message_id,
      }
    );

    return reactions;
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
      res.status(404).json({ message: "Message not found." });
      return;
    }

    res.status(200).json({ message });
  } catch (error: any) {
    next(error);
  }
};

export const getMessages = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { channelId } = req.params;
  const { limit } = req.query;
  const { before, after, around } = req.query;

  if (!channelId) {
     res.status(400).json({ message: "Channel ID is required." });
     return;
  }
  if (limit && isNaN(parseInt(limit as string))) {
     res.status(400).json({ message: "Limit must be a number." });
     return;
  }

  const channel = res.locals.channelObject;
  if (!channel.conversation_id) {
     res.status(404).json({
      message:
        "Channel does not have a conversation. Please delete and create a new channel.",
    });
     return;
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
       res.status(200).json({ messages: [] });
       return;
    }

     res.status(200).json({ messages });
     return;
  } catch (error: any) {
     next(error);
     return;
  }
};

export const searchMessages = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { serverId } = req.params;
  const { page, limit } = req.query;
  const {
    content,
    author_id,
    mentions,
    has,
    in: _inChannel,
    conversationIds,
  } = req.query;

  if (!req.query) {
    res.status(400).json({ message: "Query is required." });
    return;
  }

  const inChannel = Array.isArray(_inChannel) ? _inChannel : [_inChannel];
  const inConversation = Array.isArray(conversationIds)
    ? conversationIds
    : [conversationIds];

  if (inChannel.length === 0 && inConversation.length === 0) {
    // TODO: Do a global search for the server

    res.status(400).json({
      message:
        "At least one channel or conversation ID is required.\r\n Global search is not yet supported.",
    });
    return;
  }

  try {
    const requestBody = {
      query: {
        text: content,
        inChannel: inChannel,
        inConversation: inConversation,
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
      res.status(200).json({ messages: [] });
      return;
    }

    res.status(200).json({ messages });
  } catch (error: any) {
    next(error);
  }
};

export const getPinnedMessages = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { channelId } = req.params;

  if (!channelId) {
    res.status(400).json({ message: "Channel ID is required." });
    return;
  }

  const channel = res.locals.channelObject;
  if (!channel.conversation_id) {
    res.status(404).json({
      message:
        "Channel does not have a conversation. Please delete and create a new channel.",
    });
    return;
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
      res.status(200).json({ messages: [] });
      return;
    }

    res.status(200).json({ messages });
  } catch (error: any) {
    next(error);
  }
};

export const getReactions = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { messageId: message_id } = req.params;

  try {
    const reactions = await _getReactions(message_id);

    if (!reactions) {
      res.status(404).json({ message: "Reactions not found." });
      return;
    }

     res.status(200).json({ reactions });
     return;
  } catch (error: any) {
    next(error);
    return;
  }
};

// =========================

export const createMessage = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { channelId } = req.params;
  const { content, repliedMessageId, forwardedMessageId } = req.body;

  if (!channelId) {
     res.status(400).json({ message: "Channel ID is required." });
     return;
  }
  if (!content) {
     res.status(400).json({ message: "Content is required." });
     return;
  }
  if (content.length > 2000) {
     res.status(400).json({
      message: "Content must be less than or equal to 2000 characters.",
    });
     return;
  }

  const channel = res.locals.channelObject;
  if (!channel.conversation_id) {
     res.status(404).json({
      message:
        "Channel does not have a conversation. Please delete and create a new channel.",
    });
     return;
  }

  // Get all user, role, channel, and emoji mentions
  const mention_users = getMatches(content, user_regex, 1);
  const mention_roles = getMatches(content, role_regex, 1);
  const mention_channels = getMatches(content, channel_regex, 1);
  const emojis = getMatches(content, emoji_regex, 2);

  try {
    const requestBody = {
      conversation_id: channel.conversation_id,
      input: {
        sender_id: res.locals.uid,
        content,

        mention_users: mention_users,
        mention_roles: mention_roles,
        mention_channels: mention_channels,
        emojis: emojis,

        replied_message_id: repliedMessageId || null,
        forwarded_message_id: forwardedMessageId || null,
      },
    };
    const { createMessage: message } = await graphQLClient().request(
      messageMutations.CREATE_MESSAGE,
      requestBody
    );

     res.status(201).json({ message });
     return;
  } catch (error: any) {
     next(error);
     return;
  }
};

export const editMessage = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { messageId: message_id } = req.params;
  const { content } = req.body;

  if (!message_id) {
     res.status(400).json({ message: "Message ID is required." });
     return;
  }

  // Get the message and check if the user is the sender or they have permission to edit
  const message = await _getMessage(message_id).catch(() => null);
  if (!message) {
     res.status(404).json({ message: "Message not found." });
     return;
  }
  if (message.sender_id !== res.locals.uid) {
    const permissions = res.locals.userChannelPermissions;

    if (!permissions || permissions?.MANAGE_MESSAGE !== "ALLOWED") {
       res.status(403).json({
        message: "You do not have permission to edit this message.",
      });
       return;
    }
  }

  if (!content) {
     res.status(400).json({ message: "Content is required." });
     return;
  }

  // Get all user, role, channel, and emoji mentions
  const mention_users = getMatches(content, user_regex, 1);
  const mention_roles = getMatches(content, role_regex, 1);
  const mention_channels = getMatches(content, channel_regex, 1);
  const emojis = getMatches(content, emoji_regex, 2);

  try {
    const requestBody = {
      message_id,
      input: {
        content,

        mention_users: mention_users,
        mention_roles: mention_roles,
        mention_channels: mention_channels,
        emojis: emojis,
      },
    };

    const { editMessage: message } = await graphQLClient().request(
      messageMutations.UPDATE_MESSAGE,
      requestBody
    );

     res.status(200).json({ message });
     return;
  } catch (error: any) {
     next(error);
     return;
  }
};

export const deleteMessage = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { messageId: message_id, serverId, channelId } = req.params;

  if (!message_id) {
     res.status(400).json({ message: "Message ID is required." });
     return;
  }

  // Get the message and check if the user is the sender or they have permission to edit
  const message = await _getMessage(message_id).catch(() => null);
  if (!message) {
     res.status(404).json({ message: "Message not found." });
     return;
  }
  if (message.sender_id !== res.locals.uid) {
    // Get the user role in the channel
    const permissions = res.locals.userChannelPermissions;

    if (!permissions || permissions?.MANAGE_MESSAGE !== "ALLOWED") {
       res.status(403).json({
        message: "You do not have permission to delete this message.",
      });
       return;
    }
  }

  try {
    const { deleteMessage: deleted } = await graphQLClient().request(
      messageMutations.DELETE_MESSAGE,
      {
        message_id,
      }
    );

     res.status(200).json({ deleted });
     return;
  } catch (error: any) {
     next(error);
     return;
  }
};

export const pinMessage = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { messageId: message_id } = req.params;

  if (!message_id) {
     res.status(400).json({ message: "Message ID is required." });
     return;
  }

  try {
    const { pinMessage: pinned } = await graphQLClient().request(
      messageMutations.PIN_MESSAGE,
      {
        message_id,
      }
    );

     res.status(200).json({ pinned });
     return;
  } catch (error: any) {
     next(error);
     return;
  }
};

export const unpinMessage = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { messageId: message_id } = req.params;

  if (!message_id) {
     res.status(400).json({ message: "Message ID is required." });
     return;
  }

  try {
    const { unpinMessage: unpinned } = await graphQLClient().request(
      messageMutations.UNPIN_MESSAGE,
      {
        message_id,
      }
    );

     res.status(200).json({ unpinned });
     return;
  } catch (error: any) {
     next(error);
     return;
  }
};

export const reactMessage = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { messageId: message_id } = req.params;
  const { emoji_id } = req.body;

  if (!message_id) {
     res.status(400).json({ message: "Message ID is required." });
     return;
  }
  if (!emoji_id) {
     res.status(400).json({ message: "Emoji is required." });
     return;
  }

  try {
    const { reactMessage: reactions } = await graphQLClient().request(
      messageMutations.REACT_MESSAGE,
      {
        message_id,
        input: {
          sender_id: res.locals.uid,
          emoji: emoji_id,
        },
      }
    );

     res.status(200).json({ reactions });
     return;
  } catch (error: any) {
     next(error);
     return;
  }
};

export const unreactMessage = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { messageId: message_id } = req.params;
  const { emoji_id } = req.body;

  if (!message_id) {
     res.status(400).json({ message: "Message ID is required." });
     return;
  }
  if (!emoji_id) {
     res.status(400).json({ message: "Emoji is required." });
     return;
  }

  try {
    const { unreactMessage: reactions } = await graphQLClient().request(
      messageMutations.UNREACT_MESSAGE,
      {
        message_id,
        input: {
          sender_id: res.locals.uid,
          emoji: emoji_id,
        },
      }
    );

     res.status(200).json({ reactions });
     return;
  } catch (error: any) {
     next(error);
     return;
  }
};
