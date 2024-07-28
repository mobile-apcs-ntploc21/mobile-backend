import mongoose from "mongoose";
import { IResolvers } from "@graphql-tools/utils";
import { AuthenticationError, UserInputError } from "apollo-server";

import ServerEmojiModel from "../../models/serverEmoji";
import ServerModel from "../../models/server";
import { getAsyncIterator, publishEvent, PubSubEvents } from "../pubsub/pubsub";

/*
API GQL
extend type Query {
serverEmoji(server_id: ID!, emoji_id: ID!): ServerEmoji
serverEmojis(server_id: ID!): [ServerEmoji!]
}

extend type Mutation {
createServerEmoji(input: CreateServerEmojiInput!): ServerEmoji!
updateServerEmoji(emoji_id: ID!, name: String!): ServerEmoji!
deleteServerEmoji(emoji_id: ID!): Boolean
hardDeleteServerEmoji(emoji_id: ID!): Boolean
}
*/

const createEmojiTransaction = async (input) => {
  const session = await mongoose.startSession();
  session.startTransaction();

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
    const new_name = `undefined_deleted_${Date.now()}_${Math.floor(
      Math.random() * 1000
    )}`; // Append timestamp to name

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
      // TODO: Check if user is in server

      try {
        const emoji = await ServerEmojiModel.findOne({
          _id: emoji_id,
          server_id,
        });

        if (!emoji || emoji.is_deleted) {
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
      // Pre-check if user is authorized to create emoji. TODO: Add role check
      const user_id = context.user_id;
      if (!user_id) {
        throw new AuthenticationError("Unauthorized");
      }

      // Check server exists
      const server = await ServerModel.findById(input.server_id);
      if (!server) {
        throw new UserInputError("Server not found.");
      }

      try {
        return createEmojiTransaction(input);
      } catch (error) {
        throw new Error(error);
      }
    },
    updateServerEmoji: async (_, { emoji_id, name }, context) => {
      // Pre-check if user is authorized to update emoji. TODO: Add role check
      const user_id = context.user_id;
      if (!user_id) {
        throw new AuthenticationError("Unauthorized");
      }

      try {
        const emoji = await ServerEmojiModel.findByIdAndUpdate(
          emoji_id,
          { name },
          { new: true }
        );

        return emoji;
      } catch (error) {
        throw new Error(error);
      }
    },
    deleteServerEmoji: async (_, { emoji_id }) => {
      // Soft delete an emoji
      try {
        return deleteEmojiTransaction(emoji_id);
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
