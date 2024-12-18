import express from "express";

import graphQLClient from "@/utils/graphql";
import { directMessageQueries } from "@/graphql/queries";
import { directMessageMutations } from "@/graphql/mutations";
import { messageQueries } from "@/graphql/queries";
import { messageMutations } from "@/graphql/mutations";
import { generatePresignedUrl, getFileInfo } from "@/utils/storage";
import { v4 as uuidv4 } from "uuid";
import config from "@/config";

import { log } from "@/utils/log";

const _getDirectMessage = async (
  user_first_id: string,
  user_second_id: string
) => {
  const response = await graphQLClient().request(
    directMessageQueries.GET_DIRECT_MESSAGE,
    {
      user_first_id,
      user_second_id,
    }
  );

  return response.directMessage;
};

const _getDirectMessages = async (userId: string) => {
  const response = await graphQLClient().request(
    directMessageQueries.GET_DIRECT_MESSAGES,
    {
      user_id: userId,
    }
  );

  return response.directMessages;
};

const _createDirectMessage = async (
  user_first_id: string,
  user_second_id: string
) => {
  const response = await graphQLClient().request(
    directMessageMutations.CREATE_DIRECT_MESSAGE,
    {
      user_first_id,
      user_second_id,
    }
  );

  return response.createDirectMessage;
};

export const getDirectMessage = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  let { user_first_id } = res.locals.uid;
  let user_second_id = req.params?.userId as string;

  const { limit } = req.query;
  const { before, after, around } = req.query;

  if (!user_first_id || !user_second_id) {
    res.status(400).json({ error: "User IDs are required!" });
    return;
  }

  if (limit && isNaN(parseInt(limit as string))) {
    res.status(400).json({ message: "Limit must be a number." });
    return;
  }

  if (user_first_id > user_second_id) {
    const temp = user_first_id;
    user_first_id = user_second_id;
    user_second_id = temp;
  }

  try {
    let directMessage = await _getDirectMessage(
      user_first_id,
      user_second_id
    ).catch(() => null);

    if (!directMessage) {
      directMessage = await _createDirectMessage(
        user_first_id,
        user_second_id
      ).catch(() => null);

      if (!directMessage) {
        res.status(500).json({
          message: "Conversation does not exist, failed to get direct message.",
        });
        return;
      }
    }

    const requestBody = {
      conversation_id: directMessage.conversation_id,
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
  } catch (error) {
    next(error);
  }
};

export const getDirectMessages = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const userId = (req.params?.userId as string) ?? res.locals.uid;

  if (!userId) {
    res.status(400).json({ message: "User ID is required." });
    return;
  }

  try {
    const directMessages = await _getDirectMessages(userId);
    res.status(200).json(directMessages);
  } catch (error) {
    next(error);
  }
};

// export const createDirectMessage = async (
//   req: express.Request,
//   res: express.Response,
//   next: express.NextFunction
// ) => {
//   let { user_first_id, user_second_id } = req.body;

//   if (!user_first_id || !user_second_id) {
//     res.status(400).json({ error: "User IDs are required!" });
//     return;
//   }

//   if (user_first_id > user_second_id) {
//     const temp = user_first_id;
//     user_first_id = user_second_id;
//     user_second_id = temp;
//   }

//   try {
//     const response = await graphQLClient().request(
//       directMessageMutations.CREATE_DIRECT_MESSAGE,
//       {
//         user_first_id,
//         user_second_id,
//       }
//     );

//     res.status(201).json(response.createDirectMessage);
//   } catch (error) {
//     next(error);
//   }
// };

// export const deleteDirectMessage = async (
//   req: express.Request,
//   res: express.Response,
//   next: express.NextFunction
// ) => {
//   const { conversationId } = req.params;

//   if (!conversationId) {
//     res.status(400).json({ error: "Conversation ID is required!" });
//     return;
//   }

//   try {
//     await graphQLClient().request(
//       directMessageMutations.DELETE_DIRECT_MESSAGE,
//       {
//         conversation_id: conversationId,
//       }
//     );

//     res.status(204).end();
//   } catch (error) {
//     next(error);
//   }
// };

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

export const searchMessages = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { page, limit } = req.query;
  const {
    content,
    author_id: _author_id,
    mentions: _mentions,
    has: _has,
  } = req.query;

  let user_first_id = res.locals.uid;
  let user_second_id = req.params?.userId as string;

  if (!user_first_id || !user_second_id) {
    res.status(400).json({ message: "User IDs are required." });
    return;
  }

  if (user_first_id === user_second_id) {
    res.status(400).json({ message: "User IDs must be different." });
    return;
  }

  if (!content) {
    res.status(400).json({ message: "Content is required." });
    return;
  }

  if (!req.query) {
    res.status(400).json({ message: "Query is required." });
    return;
  }

  if (user_first_id > user_second_id) {
    const temp = user_first_id;
    user_first_id = user_second_id;
    user_second_id = temp;
  }

  const author_id = _author_id
    ? Array.isArray(_author_id)
      ? _author_id
      : [_author_id]
    : [];
  const mentions = _mentions
    ? Array.isArray(_mentions)
      ? _mentions
      : [_mentions]
    : [];
  const has = _has ? (Array.isArray(_has) ? _has : [_has]) : [];

  try {
    const requestBody = {
      query: {
        text: content,
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
  let user_first_id = res.locals.uid;
  let user_second_id = req.params?.userId as string;

  if (!user_first_id || !user_second_id) {
    res.status(400).json({ message: "User IDs are required." });
    return;
  }

  if (user_first_id === user_second_id) {
    res.status(400).json({ message: "User IDs must be different." });
    return;
  }

  if (user_first_id > user_second_id) {
    const temp = user_first_id;
    user_first_id = user_second_id;
    user_second_id = temp;
  }

  const conversation = await _getDirectMessage(user_first_id, user_second_id);

  if (!conversation) {
    res.status(404).json({ message: "Conversation not found." });
    return;
  }

  try {
    const { pinnedMessages: messages } = await graphQLClient().request(
      messageQueries.GET_PINNED_MESSAGES,
      {
        conversation_id: conversation.conversation_id,
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

// =========================

export const createMessage = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { content, repliedMessageId, forwardedMessageId, attachments } =
    req.body;

  let user_first_id = res.locals.uid;
  let user_second_id = req.params?.userId as string;

  if (!user_first_id || !user_second_id) {
    res.status(400).json({ message: "User IDs are required." });
    return;
  }

  if (user_first_id === user_second_id) {
    res.status(400).json({ message: "User IDs must be different." });
    return;
  }

  if (!content && (!attachments || attachments.length === 0)) {
    res.status(400).json({ message: "Content is required." });
    return;
  }
  if (content.length > 2000) {
    res.status(400).json({
      message: "Content must be less than or equal to 2000 characters.",
    });
    return;
  }

  if (user_first_id > user_second_id) {
    const temp = user_first_id;
    user_first_id = user_second_id;
    user_second_id = temp;
  }

  const conversation = await _getDirectMessage(user_first_id, user_second_id);
  if (!conversation) {
    res.status(404).json({ message: "Conversation not found." });
    return;
  }

  // Transform the attachments
  const transformedAttachments = await Promise.all(
    attachments?.map(async (attachment: any) => {
      if (!attachment.filename || !attachment.key) {
        res.status(400).json({
          message: "Attachment file name and key are required.",
        });
      }

      const fileInfo = await getFileInfo(attachment.key);
      if (!fileInfo) {
        res.status(404).json({ message: "Attachment not found." });
        return;
      }

      let attachmentType = "FILE";
      if (fileInfo.contentType?.includes("image")) {
        attachmentType = "IMAGE";
      } else if (fileInfo.contentType?.includes("video")) {
        attachmentType = "VIDEO";
      } else if (fileInfo.contentType?.includes("audio")) {
        attachmentType = "AUDIO";
      }

      const url = `https://${config.CDN_URL}/${attachment.key}`;
      return {
        type: attachmentType,
        size: fileInfo.contentLength,
        url: url,
        filename: attachment.filename,
      };
    }) || []
  );

  // Get all user, role, channel, and emoji mentions
  const mention_users = getMatches(content, user_regex, 1);
  const mention_roles = getMatches(content, role_regex, 1);
  const mention_channels = getMatches(content, channel_regex, 1);
  const emojis = getMatches(content, emoji_regex, 2);

  try {
    const requestBody = {
      conversation_id: conversation.conversation_id,
      input: {
        sender_id: res.locals.uid,
        content,
        attachments: transformedAttachments,

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

export const uploadFile = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { filename, fileType, fileSize } = req.body;
  let user_first_id = res.locals.uid;
  let user_second_id = req.params?.userId as string;

  if (!user_first_id || !user_second_id) {
    res.status(400).json({ message: "User IDs are required." });
    return;
  }

  if (user_first_id === user_second_id) {
    res.status(400).json({ message: "User IDs must be different." });
    return;
  }

  if (!filename) {
    res.status(400).json({ message: "File name are required." });
    return;
  }

  if (!fileType) {
    res.status(400).json({ message: "File type is required." });
    return;
  }

  if (!fileSize) {
    res.status(400).json({ message: "File size is required." });
    return;
  }

  if (user_first_id > user_second_id) {
    const temp = user_first_id;
    user_first_id = user_second_id;
    user_second_id = temp;
  }

  if (fileSize > 10485760) {
    res.status(400).json({ message: "File size must be less than 10MB." });
    return;
  }

  const conversation = await _getDirectMessage(user_first_id, user_second_id);
  if (!conversation) {
    res.status(404).json({
      message:
        "Conversation not found. Please create a conversation before uploading files.",
    });
    return;
  }

  try {
    const fileExtension = filename.split(".").pop();
    const key = `attachments/${user_first_id}/${user_second_id}/${uuidv4()}.${fileExtension}`;

    const { url: uploadUrl, fields } = await generatePresignedUrl(
      key,
      fileType,
      fileSize
    );
    res.status(200).json({ uploadUrl, fields, key });

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
