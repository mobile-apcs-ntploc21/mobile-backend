import { IResolvers } from "@graphql-tools/utils";
import { UserInputError } from "apollo-server";
import mongoose, { ObjectId } from "mongoose";

import LastReadModel from "@/models/conversations/last_read";
import MessageModel from "@/models/conversations/message";

// =======================

interface ILastRead {
  user_id: ObjectId;
  conversation_id: ObjectId;
  last_message_read_id: ObjectId;
}

// =======================

/**
 * Get last read of a user in a conversation
 *
 * @async
 * @param {*} user_id - ID of the user
 * @param {*} conversation_id - ID of the conversation
 * @returns {Promise<ILastRead>} - Last read of the user in the conversation
 */
const getLastRead = async (user_id, conversation_id): Promise<ILastRead> => {
  const lastRead = await LastReadModel.findOne({
    user_id,
    conversation_id,
  }).lean();

  if (!lastRead) {
    throw new UserInputError("Last read not found");
  }

  return {
    user_id: lastRead._id.user_id,
    conversation_id: lastRead._id.conversation_id,
    last_message_read_id: lastRead.last_message_read_id,
  };
};

/**
 * Transaction for creating a last read of a user in a conversation
 *
 * @async
 * @param {*} input - Input for creating a last read
 * @returns {Promise<ILastRead>}
 */
const createLastRead = async (input): Promise<ILastRead> => {
  // Begin a transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [lastRead] = await LastReadModel.create(
      [
        {
          user_id: input.user_id,
          conversation_id: input.conversation_id,
          last_message_read_id: input.message_id,
        },
      ],
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return {
      user_id: lastRead._id.user_id,
      conversation_id: lastRead._id.conversation_id,
      last_message_read_id: lastRead.last_message_read_id,
    };
  } catch (error: any) {
    // Rollback the transaction
    await session.abortTransaction();
    session.endSession();

    throw new Error(error.message);
  }
};

const updateLastRead = async (input) => {
  // Begin a transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  let message_id = input.message_id;
  if (!message_id) {
    // Get the latest message in the conversation
    const lastestMessage = await MessageModel.findOne({
      conversation_id: input.conversation_id,
    })
      .sort({ createdAt: -1 })
      .lean();

    message_id = String(lastestMessage._id);
  }

  try {
    const lastRead = await LastReadModel.findOne({
      "_id.user_id": input.user_id,
      "_id.conversation_id": input.conversation_id,
    }).lean();

    // If last read is not found, create a new one
    let lastReadUpdated = null;
    if (!lastRead) {
      [lastReadUpdated] = await LastReadModel.create(
        [
          {
            "_id.user_id": input.user_id,
            "_id.conversation_id": input.conversation_id,
            last_message_read_id: message_id,
          },
        ],
        { session, new: true }
      );
    } else {
      lastReadUpdated = await LastReadModel.findOneAndUpdate(
        {
          "_id.user_id": input.user_id,
          "_id.conversation_id": input.conversation_id,
        },
        {
          last_message_read_id: message_id,
        },
        { session, new: true }
      );
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return {
      user_id: lastReadUpdated._id.user_id,
      conversation_id: lastReadUpdated._id.conversation_id,
      last_message_read_id: lastReadUpdated.last_message_read_id,
    };
  } catch (error: any) {
    // Rollback the transaction
    await session.abortTransaction();
    session.endSession();

    throw new Error(error.message);
  }
};

const resolvers: IResolvers = {
  Query: {
    getLastRead: async (_, { user_id, conversation_id }) =>
      getLastRead(user_id, conversation_id),
  },
  Mutation: {
    createLastRead: async (_, { input }) => createLastRead(input),
    updateLastRead: async (_, { input }) => updateLastRead(input),
  },
};

export default resolvers;
