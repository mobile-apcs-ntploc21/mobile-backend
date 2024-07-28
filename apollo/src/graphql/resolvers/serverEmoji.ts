import mongoose from "mongoose";
import { IResolvers } from "@graphql-tools/utils";
import { AuthenticationError, UserInputError } from "apollo-server";

import ServerEmojiModel from "../../models/serverEmoji";
import ServerModel from "../../models/server";
import UserModel from "../../models/user";
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

const serverEmojiAPI: IResolvers = {
  Query: {
    serverEmoji: async (_, { server_id, emoji_id }) => {
      // TODO: Check if user is in server

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

      const emojis = await ServerEmojiModel.find({ server_id }).catch(
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
    updateServerEmoji: async (_, { emoji_id, name, is_deleted }, context) => {
      // Pre-check if user is authorized to update emoji. TODO: Add role check
      const user_id = context.user_id;
      if (!user_id) {
        throw new AuthenticationError("Unauthorized");
      }

      const update: { name?: string; is_deleted?: boolean } = {
        ...(name && { name }),
        ...(is_deleted !== undefined && { is_deleted }),
      };

      try {
        const emoji = await ServerEmojiModel.findByIdAndUpdate(
          emoji_id,
          { ...update },
          { new: true }
        );

        if (is_deleted) {
          // Decrement emoji count
          await ServerModel.findByIdAndUpdate(emoji.server_id, {
            $inc: { totalEmojis: -1 },
          });
        }

        publishEvent(PubSubEvents.emojiUpdated, {
          server_id: emoji.server_id,
          type: PubSubEvents.emojiUpdated,
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
      // Hard delete
      try {
        await ServerEmojiModel.findByIdAndDelete(emoji_id);

        return true;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};

export default { API: serverEmojiAPI };
