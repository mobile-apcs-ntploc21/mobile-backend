import mongoose from "mongoose";
import { IResolvers } from "@graphql-tools/utils";
import {
  AuthenticationError,
  UserInputError,
  ValidationError,
} from "apollo-server";

import ServerEmojiModel from "../../models/serverEmoji";
import ServerModel from "../../models/server";
import { publishEvent, ServerEvents } from "../pubsub/pubsub";

const createEmojiTransaction = async (input) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  // Check the total emojis exceeded the limit
  const server = await ServerModel.findById(input.server_id).session(session);
  if (server.totalEmojis >= 50) {
    throw new ValidationError("Server emoji limit reached.");
  }

  try {
    const opts = { session, new: true };
    const emoji = await ServerEmojiModel.create([input], opts);

    // Increment emoji count
    await ServerModel.findByIdAndUpdate(
      input.server_id,
      {
        $inc: { totalEmojis: 1 },
      },
      opts
    );

    await session.commitTransaction();
    session.endSession();

    return emoji[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(error);
  }
};

const deleteEmojiTransaction = async (emoji_id) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const new_name = `deleted_${Date.now()}_${Math.floor(
      Math.random() * 1000
    )}`; // Create a new name for the emoji to avoid conflicts with names
    // Example: deleted_1630000000000_123

    const emoji = await ServerEmojiModel.findByIdAndUpdate(
      emoji_id,
      { name: new_name, is_deleted: true },
      { session, new: true }
    );

    // Decrement emoji count
    await ServerModel.findByIdAndUpdate(
      emoji.server_id,
      {
        $inc: { totalEmojis: -1 },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return true;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(error);
  }
};

const serverEmojiAPI: IResolvers = {
  Query: {
    serverEmoji: async (_, { server_id, emoji_id }) => {
      try {
        const emoji = await ServerEmojiModel.findOne({
          _id: emoji_id,
          server_id,
        });

        if (!emoji) {
          throw new UserInputError("Emoji not found.");
        }

        return emoji;
      } catch (error) {
        throw new Error(error);
      }
    },
    serverEmojis: async (_, { server_id }) => {
      // TODO: Check if user is in server

      const emojis = await ServerEmojiModel.find({
        server_id,
        is_deleted: false,
      }).catch(
        () => [] // Return empty array if no emojis found or server not found
      );

      return emojis;
    },
  },
  Mutation: {
    createServerEmoji: async (_, { input }, context) => {
      // Check server exists
      const server = await ServerModel.findById(input.server_id);
      if (!server) {
        throw new UserInputError("Server not found.");
      }

      try {
        const emoji = await createEmojiTransaction(input);

        publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.emojiAdded,
          server_id: input.server_id,
          data: {
            ...emoji.toObject(),
          },
        });

        return emoji;
      } catch (error) {
        throw new Error(error);
      }
    },
    updateServerEmoji: async (_, { emoji_id, name }, context) => {
      try {
        const emoji = await ServerEmojiModel.findOneAndUpdate(
          { _id: emoji_id, is_deleted: false },
          { name },
          { new: true }
        );

        if (!emoji) {
          throw new UserInputError("Emoji not found. Maybe it was deleted.");
        }

        publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.emojiUpdated,
          server_id: emoji.server_id,
          data: {
            ...emoji.toObject(),
          },
        });

        return emoji;
      } catch (error) {
        throw new Error(error);
      }
    },
    deleteServerEmoji: async (_, { emoji_id }) => {
      // Soft delete an emoji (mark as deleted, the image is still in the database)
      try {
        const is_deleted = await deleteEmojiTransaction(emoji_id);

        publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.emojiDeleted,
          server_id: emoji_id,
          data: {
            emoji_id,
          },
        });

        return is_deleted;
      } catch (error) {
        throw new Error(error);
      }
    },
    hardDeleteServerEmoji: async (_, { emoji_id }) => {
      // Hard delete an emoji
      try {
        const emoji = await ServerEmojiModel.findByIdAndDelete(emoji_id);

        // Decrement emoji count
        await ServerModel.findByIdAndUpdate(emoji.server_id, {
          $inc: { totalEmojis: -1 },
        });

        return true;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};

export default { API: serverEmojiAPI };
