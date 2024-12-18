import express from "express";

import graphQLClient from "@/utils/graphql";
import { directMessageQueries } from "@/graphql/queries";
import { directMessageMutations } from "@/graphql/mutations";
import { log } from "@/utils/log";

const _getDirectMessage = async (conversationId: string) => {
  const response = await graphQLClient().request(
    directMessageQueries.GET_DIRECT_MESSAGE,
    {
      conversation_id: conversationId,
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

export const getDirectMessage = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { conversationId } = req.params;

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
  const { userId } = req.params;
  try {
    const directMessages = await _getDirectMessages(userId);
    res.status(200).json(directMessages);
  } catch (error) {
    next(error);
  }
};

export const createDirectMessage = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { user_first_id, user_second_id } = req.body;

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
    const response = await graphQLClient().request(
      directMessageMutations.CREATE_DIRECT_MESSAGE,
      {
        user_first_id,
        user_second_id,
      }
    );

    res.status(201).json(response.createDirectMessage);
  } catch (error) {
    next(error);
  }
};

export const deleteDirectMessage = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { conversationId } = req.params;

  if (!conversationId) {
    res.status(400).json({ error: "Conversation ID is required!" });
    return;
  }

  try {
    await graphQLClient().request(
      directMessageMutations.DELETE_DIRECT_MESSAGE,
      {
        conversation_id: conversationId,
      }
    );

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
