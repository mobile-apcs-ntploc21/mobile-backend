import express from "express";

import { processImage } from "../../utils/storage";
import graphQLClient from "../../utils/graphql";
import { serverEmojiQueries } from "../../graphql/queries";
import { serverEmojiMutations } from "../../graphql/mutations";

const _getServerEmojis = async (server_id: string) => {
  const response = await graphQLClient().request(
    serverEmojiQueries.GET_SERVER_EMOJIS,
    {
      server_id,
    }
  );

  return response.serverEmojis;
};

const _getServerEmoji = async (server_id: string, emoji_id: string) => {
  const response = await graphQLClient().request(
    serverEmojiQueries.GET_SERVER_EMOJI,
    {
      server_id,
      emoji_id,
    }
  );

  return response.serverEmoji;
};

const _countServerEmojis = async (server_id: string) => {
  const response = await graphQLClient().request(
    serverEmojiQueries.COUNT_SERVER_EMOJIS,
    {
      server_id,
    }
  );

  return response.countServerEmojis;
};

const handleMongooseError = (error: any, error_code: number) => {
  const errors = error?.response?.errors;
  if (errors && errors.length > 0) {
    const errorMessage = errors[0].message;
    if (errorMessage.includes(error_code)) {
      return true;
    }
  }
  return false;
};

// ============================

export const getServerEmoji = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { serverId, emojiId } = req.params;

  if (!serverId || !emojiId) {
    return res
      .status(400)
      .json({ message: "Server ID and Emoji ID are required." });
  }

  try {
    const emoji = await _getServerEmoji(serverId, emojiId).catch(() => null);

    if (!emoji) {
      return res.status(404).json({ message: "Emoji not found." });
    }

    return res.status(200).json({ ...emoji });
  } catch (error) {
    return next(error);
  }
};

export const getServerEmojis = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { serverId } = req.params;

  if (!serverId) {
    return res.status(400).json({ message: "Server ID is required." });
  }

  try {
    const emojis = await _getServerEmojis(serverId).catch(() => []);

    return res.status(200).json(emojis);
  } catch (error) {
    return next(error);
  }
};

export const createServerEmoji = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { serverId } = req.params;
  const user_id = res.locals.uid;
  const { name, image } = req.body;

  if (!serverId || !name || !image) {
    return res
      .status(400)
      .json({ message: "Server ID, name, and image are required." });
  }

  try {
    const totalEmojis = await _countServerEmojis(serverId);

    console.log(totalEmojis);

    if (totalEmojis >= 20) {
      return res.status(400).json({ message: "Server emoji limit reached." });
    }

    const image_url = await processImage(image, `emojis/${serverId}`);

    if (!image_url) {
      return res.status(500).json({ message: "Failed to upload image." });
    }

    const emoji = await graphQLClient().request(
      serverEmojiMutations.CREATE_SERVER_EMOJI,
      {
        input: {
          server_id: serverId,
          name,
          image_url: image_url,
          uploader_id: user_id,
        },
      }
    );

    return res
      .status(201)
      .json({ message: "Emoji created.", ...emoji.createServerEmoji });
  } catch (error) {
    if (handleMongooseError(error, 11000)) {
      return res.status(400).json({ message: "Emoji name already exists." });
    }

    return next(error);
  }
};

export const updateServerEmoji = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { serverId, emojiId } = req.params;
  const { name } = req.body;

  if (!serverId || !emojiId || !name) {
    return res
      .status(400)
      .json({ message: "Server ID, emoji ID, and name are required." });
  }

  try {
    const emoji = await _getServerEmoji(serverId, emojiId).catch(() => null);

    if (!emoji) {
      return res.status(404).json({ message: "Emoji not found." });
    }

    await graphQLClient().request(serverEmojiMutations.UPDATE_SERVER_EMOJI, {
      emoji_id: emojiId,
      name,
    });

    return res.status(200).json({ message: "Emoji updated." });
  } catch (error) {
    if (handleMongooseError(error, 11000)) {
      return res.status(400).json({ message: "Emoji name already exists." });
    }

    return next(error);
  }
};

export const deleteServerEmoji = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { serverId, emojiId } = req.params;

  if (!serverId || !emojiId) {
    return res
      .status(400)
      .json({ message: "Server ID and emoji ID are required." });
  }

  try {
    const emoji = await _getServerEmoji(serverId, emojiId).catch(() => null);

    if (!emoji) {
      return res.status(404).json({ message: "Emoji not found." });
    }

    await graphQLClient().request(serverEmojiMutations.DELETE_SERVER_EMOJI, {
      emoji_id: emojiId,
    });

    return res.status(200).json({ message: "Emoji deleted." });
  } catch (error) {
    return next(error);
  }
};
