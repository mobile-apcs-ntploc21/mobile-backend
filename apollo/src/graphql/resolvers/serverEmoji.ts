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
      try {
        const emojis = await ServerEmojiModel.find({ server_id });

        return emojis;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  Mutation: {
    createServerEmoji: async (_, { input }) => {
      try {
        const emoji = await ServerEmojiModel.create(input);

        // Increment emoji count
        await ServerModel.findByIdAndUpdate(input.server_id, {
          $inc: { emoji_count: 1 },
        });

        publishEvent(PubSubEvents.emojiAdded, {
          server_id: input.server_id,
          type: PubSubEvents.emojiAdded,
          data: {
            ...emoji.toObject(),
          },
        });

        return emoji;
      } catch (error) {
        throw new Error(error);
      }
    },
    updateServerEmoji: async (_, { emoji_id, name, is_deleted }) => {
      const update: { name?: string; is_deleted?: boolean } = {
        ...(name && { name }),
        ...(is_deleted !== undefined && { is_deleted }),
      };

      try {
        const emoji = await ServerEmojiModel.findByIdAndUpdate(
          emoji_id,
          { update },
          { new: true }
        );

        if (is_deleted) {
          // Decrement emoji count
          await ServerModel.findByIdAndUpdate(emoji.server_id, {
            $inc: { emoji_count: -1 },
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
