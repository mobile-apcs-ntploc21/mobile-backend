import { IResolvers } from "@graphql-tools/utils";
import { UserInputError } from "apollo-server";
import mongoose from "mongoose";

import serverModel from "@models/servers/server";
import channelModel from "@models/servers/channels/channel";
import messageModel from "@models/conversations/message";
import reactionModel from "@/models/conversations/reaction";
import conversationModel from "@models/conversations/conversation";
import mentionModel from "@/models/conversations/mention";
import attachmentModel from "@models/conversations/attachment";
import userModel from "@models/user";

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
  const reactions = await reactionModel.find({
    message_id: message_id,
  });

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
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    throw e;
  }

  // Return a list of reactions
  const reactions = await reactionModel.find({
    message_id: message_id,
  });
  return reactions;
};

const unreactMessage = async (
  message_id: string,
  input: { sender_id: string; emoji: string }
) => {
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
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    throw e;
  }

  // Return a list of reactions
  const reactions = await reactionModel.find({
    message_id: message_id,
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
