import { IResolvers } from "@graphql-tools/utils";
import { UserInputError } from "apollo-server";
import mongoose from "mongoose";

// import ServerEmoji from "@/models/servers/serverEmoji";
import reactionModel from "@/models/conversations/reaction";
import EmojiModel from "@/models/emojis";
import messageModel from "@models/conversations/message";
import userModel from "@models/user";
import channelModel from "@models/servers/channels/channel";
import { publishEvent, ServerEvents } from "@/graphql/pubsub/pubsub";

// ===========================

/**
 * Get all reactions of a given message.
 *
 * @async
 * @param {string} message_id - The ID of the message.
 * @returns {unknown} - The reactions of the message.
 */
const getReactions = async (message_id: string) => {
  // Check if message exists
  const message = await messageModel.findById(message_id);
  if (!message) {
    throw new UserInputError("Message not found!");
  }

  // Get all reactions
  const reactions = await reactionModel
    .find({
      message_id: message_id,
    })
    .lean();

  return reactions;
};

/**
 * React to a message.
 *
 * @async
 * @param {string} message_id - The ID of the message.
 * @param {{ sender_id: string; emoji: string }} input - The sender ID and emoji.
 * @returns {unknown} - The reaction.
 */
const reactMessage = async (
  message_id: string,
  input: { sender_id: string; emoji: string }
) => {
  let channel = null;

  // Start a session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if message exists
    const message = await messageModel
      .findById(message_id)
      .session(session)
      .lean();
    if (!message) {
      throw new UserInputError("Message not found!");
    }

    // Check if user exists
    const user = await userModel
      .findById(input.sender_id)
      .session(session)
      .lean();
    if (!user) {
      throw new UserInputError("User not found!");
    }

    // Check if emoji exists
    const emoji = await EmojiModel.findById(input.emoji)
      .session(session)
      .lean();
    if (!emoji) {
      throw new UserInputError("Emoji not found!");
    }

    // Check if the reaction already exists
    const existingReaction = await reactionModel.findOne({
      message_id: message_id,
      sender_id: input.sender_id,
      emoji_id: input.emoji,
    });
    if (existingReaction) {
      throw new UserInputError("Reaction already exists!");
    }

    // Create a reaction document
    const [reaction] = await reactionModel.create(
      [
        {
          message_id: message_id,
          sender_id: input.sender_id,
          emoji_id: input.emoji,
        },
      ],
      { session, new: true }
    );

    // Commit the session
    await session.commitTransaction();
    session.endSession();

    channel = await channelModel
      .findOne({
        conversation_id: message.conversation_id,
      })
      .lean();
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    throw e;
  }

  // Return a list of reactions
  const reactions = await reactionModel
    .find({
      message_id: message_id,
    })
    .lean();

  // Publish reaction event
  // Publish the event only if the message is in a server
  if (channel) {
    publishEvent(ServerEvents.messageReactionAdded, {
      server_id: channel.server_id,
      type: ServerEvents.messageReactionAdded,
      data: {
        message_id: message_id,
        conversation_id: channel.conversation_id,
        reactions: reactions,
      },
    });
  }

  return reactions;
};

const unreactMessage = async (
  message_id: string,
  input: { sender_id: string; emoji: string }
) => {
  let channel = null;

  // Start a session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if message exists
    const message = await messageModel.findById(message_id).session(session);
    if (!message) {
      throw new UserInputError("Message not found!");
    }

    // Check if user exists
    const user = await userModel.findById(input.sender_id).session(session);
    if (!user) {
      throw new UserInputError("User not found!");
    }

    // Delete the reaction
    await reactionModel.deleteOne(
      {
        message_id: message_id,
        sender_id: input.sender_id,
        emoji_id: input.emoji,
      },
      { session }
    );

    // Commit the session
    await session.commitTransaction();
    session.endSession();

    // Get the channel from the message
    channel = await channelModel
      .findOne({
        conversation_id: message.conversation_id,
      })
      .lean();
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    throw e;
  }

  // Return a list of reactions
  const reactions = await reactionModel
    .find({
      message_id: message_id,
    })
    .lean();

  // Publish reaction event (unreact)
  publishEvent(ServerEvents.messageReactionRemoved, {
    // @ts-ignore
    server_id: channel.server_id,
    type: ServerEvents.messageReactionRemoved,
    data: {
      message_id: message_id,
      // @ts-ignore
      conversation_id: channel.conversation_id,
      reactions: reactions,
    },
  });

  return reactions;
};

// ===========================

const reactionAPI: IResolvers = {
  Query: {
    reactions: async (_, { message_id }) => getReactions(message_id),
  },
  Mutation: {
    reactMessage: async (_, { message_id, input }) =>
      reactMessage(message_id, input),
    unreactMessage: async (_, { message_id, input }) =>
      unreactMessage(message_id, input),
  },
};

const reactionSubscription: IResolvers = {};

export default { API: reactionAPI };
