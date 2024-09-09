import { IResolvers } from "@graphql-tools/utils";
import { UserInputError } from "apollo-server";
import mongoose from "mongoose";

import serverModel from "@models/servers/server";
import channelModel from "@models/servers/channels/channel";
import messageModel from "@models/conversations/message";
import conversationModel from "@models/conversations/conversation";
import mentionModel from "@/models/conversations/mention";
import attachmentModel from "@models/conversations/attachment";

// ==========================
interface IMessage {
  id: string;

  conversation_id: string;
  sender_id: string;

  content: string;
  replied_message_id?: string;
  forwarded_message_id?: string;

  mention_users?: string[];
  mention_roles?: string[];
  mention_channels?: string[];
  emojis?: string[];
  reactions?: string[];
  replied_message?: IMessage;

  is_deleted?: boolean;
  is_pinned?: boolean;
}

// ==========================

/**
 * Cast a message to IMessage
 *
 * @param {*} message - The message object
 * @param {?*} [extra] - Extra fields. If not provided, it will be initialized and fetched
 * @returns {IMessage}
 */
const castToIMessage = (message: any, extra?: any): IMessage => {
  let mention_users = extra?.mention_users || [];
  let mention_roles = extra?.mention_roles || [];
  let mention_channels = extra?.mention_channels || [];
  let emojis = extra?.emojis || [];
  let reactions = [];
  let replied_message = null;

  // TODO: Implement these fields
  if (!extra) {
  }

  // Return the message
  return {
    id: message._id,
    conversation_id: message.conversation_id,
    sender_id: message.sender_id,
    content: message.content,
    replied_message_id: message.replied_message_id,
    forwarded_message_id: message.forwarded_message_id,

    mention_users: mention_users,
    mention_roles: mention_roles,
    mention_channels: mention_channels,
    emojis: emojis,
    reactions: reactions,
    replied_message: replied_message,

    is_deleted: message.is_deleted,
    is_pinned: message.is_pinned,
  };
};

/**
 * Get a message by ID
 *
 * @async
 * @param {string} id - The message ID
 * @returns {Promise<IMessage>} - The message object
 */
const getMessage = async (id: string): Promise<IMessage> => {
  const message = await messageModel.findById(id);
  if (!message || message.is_deleted) {
    throw new UserInputError("Message not found or has been deleted!");
  }
  return castToIMessage(message);
};

/**
 * Get all messages, given limit, before, after, or around a message.
 * If multiple arguments are provided, the priority is before > after > around
 *
 * @async
 * @param {string} conversation_id - The conversation ID
 * @param {number} limit - The limit of messages to return. Automatically capped at 50
 * @param {string} before - The message ID to get messages before
 * @param {string} after - The message ID to get messages after
 * @param {string} around - The message ID to get messages around
 * @returns {IMessage[]} - Array of messages
 */
const getMessages = async (
  conversation_id: string,
  limit: number,
  before?: string,
  after?: string,
  around?: string
): Promise<IMessage[]> => {
  // Fix the limit range to [1; 50]
  limit = Math.min(Math.max(limit, 1), 50);

  // Check if conversation ID exists
  const conversation = await conversationModel.findById(conversation_id);
  if (!conversation) {
    throw new UserInputError("Conversation/Chat not found!");
  }

  // Initialize the messages array and query
  let messages = [];
  if (before) {
    messages = await messageModel
      .find({
        conversation_id,
        is_deleted: false,
        _id: { $lt: before },
      })
      .sort({ _id: -1 })
      .limit(limit);
  } else if (after) {
    messages = await messageModel
      .find({
        conversation_id,
        is_deleted: false,
        _id: { $gt: after },
      })
      .sort({ _id: 1 })
      .limit(limit);
  } else if (around) {
    const halfLimit = Math.floor(limit / 2);
    const upper = await messageModel
      .find({
        conversation_id,
        is_deleted: false,
        _id: { $gt: around },
      })
      .sort({ _id: 1 })
      .limit(halfLimit);
    const lower = await messageModel
      .find({
        conversation_id,
        is_deleted: false,
        _id: { $lt: around },
      })
      .sort({ _id: -1 })
      .limit(limit - halfLimit);

    messages = [...lower, ...upper];
  } else {
    // Throw an error
    throw new UserInputError("Invalid arguments!");
  }

  // Cast the messages to IMessage
  return messages.map((message) => castToIMessage(message));
};

/**
 * Search messages in a server (or in a conversation) based on the given query
 *
 * @async
 * @param {string} server_id - The server ID. If not provided, inChannel must be provided
 * @param {number} offset - The offset (used for pagination)
 * @param {number} limit - The limit of messages to return. Automatically capped at 50
 * @param {?string} [inChannel] - The channel ID to search in
 * @param {?string} [text] - The text to search for
 * @param {?string} [from] - The user ID to search for
 * @param {?string} [mention] - The user ID to search for in mentions
 * @param {?*} [has] - The attachment type to search for
 * @returns {Promise<IMessage[]>}
 */
const searchMessages = async (
  server_id: string,
  offset: number,
  limit: number,

  inChannel?: string,
  text?: string,
  from?: string,
  mention?: string,
  has?: any
): Promise<IMessage[]> => {
  // Fix the limit range to [1; 50]
  limit = Math.min(Math.max(limit, 1), 50);

  // Initialize the messages array and query
  let messages = [];

  // Check if server_id and inChannel is provided
  if (!server_id && !inChannel) {
    throw new UserInputError("Server ID or in field is required!");
  }

  if (server_id) {
    const server = await serverModel.findById(server_id);
    if (!server) {
      throw new UserInputError("Server not found!");
    }
  }

  // TODO: Implement the search query

  return messages;
};

/**
 * Transaction for creating a message in a conversation
 *
 * @async
 * @param {string} conversation_id - The conversation ID
 * @param {any} input - The message input. Contains sender_id, content, mentions, and replied_message_id
 * @returns {Promise<IMessage>}
 */
const createMessageTransaction = async (
  conversation_id: string,
  input: any
): Promise<IMessage> => {
  // Extract the input
  const {
    sender_id,
    content,
    mention_users,
    mention_roles,
    mention_channels,
    emojis,
    replied_message_id,
    forwarded_message_id,
  } = input;

  // Check if conversation ID exists
  const conversation = await conversationModel.findById(conversation_id);
  if (!conversation) {
    throw new UserInputError("Conversation/Chat not found!");
  }

  // Start a session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create the message
    const [message] = await messageModel.create(
      [
        {
          conversation_id,
          sender_id,
          content,
          replied_message_id,
          forwarded_message_id,
        },
      ],
      { session, new: true }
    );

    // Create the mentions
    await mentionModel.create(
      [
        ...mention_users.map((user_id) => ({
          conversation_id,
          message_id: message._id,
          mention_user_id: user_id,
        })),
        ...mention_roles.map((role_id) => ({
          conversation_id,
          message_id: message._id,
          mention_role_id: role_id,
        })),
        ...mention_channels.map((channel_id) => ({
          conversation_id,
          message_id: message._id,
          mention_channel_id: channel_id,
        })),
      ],
      { session, new: true }
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return castToIMessage(message, {
      mention_users,
      mention_roles,
      mention_channels,
      emojis,
    });
  } catch (error) {
    // Abort the transaction
    await session.abortTransaction();
    session.endSession();

    throw error;
  }
};

/**
 * Transaction for updating a message in a conversation.
 * It will also update the mentions associated with the message.
 *
 * @async
 * @param {string} message_id - The message ID
 * @param {any} input - The message input. Contains content and list of mentions.
 * @returns {Promise<IMessage>}
 */
const updateMessageTransaction = async (
  message_id: string,
  input: any
): Promise<IMessage> => {
  // Extract the input
  const { content, mention_users, mention_roles, mention_channels, emojis } =
    input;

  // Start a session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Update the message
    const message = await messageModel.findByIdAndUpdate(
      message_id,
      { content },
      { session, new: true }
    );

    // Remove all mentions associated with the message
    await mentionModel.deleteMany({ message_id }, { session });

    // Create the mentions
    await mentionModel.create(
      [
        ...mention_users.map((user_id) => ({
          ...message.conversation_id,
          message_id: message._id,
          mention_user_id: user_id,
        })),
        ...mention_roles.map((role_id) => ({
          ...message.conversation_id,
          message_id: message._id,
          mention_role_id: role_id,
        })),
        ...mention_channels.map((channel_id) => ({
          ...message.conversation_id,
          message_id: message._id,
          mention_channel_id: channel_id,
        })),
      ],
      { session, new: true }
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    return castToIMessage(message, {
      mention_users,
      mention_roles,
      mention_channels,
      emojis,
    });
  } catch (error) {
    // Abort the transaction
    await session.abortTransaction();
    session.endSession();

    throw error;
  }
};

/**
 * Transaction for delete a message in a conversation
 *
 * @async
 * @param {string} message_id - The message ID
 * @returns {Promise<Boolean>} - True if the message is deleted
 */
const deleteMessageTransaction = async (
  message_id: string
): Promise<Boolean> => {
  // Start a session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Update the message
    const message = await messageModel.findByIdAndUpdate(
      {
        _id: message_id,
      },
      {
        is_deleted: true,
      },
      { session, new: true }
    );

    if (!message) {
      throw new UserInputError("Message not found!");
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    return true;
  } catch (e) {
    // Abort the transaction
    await session.abortTransaction();
    session.endSession;
  }

  return true;
};

/**
 * Pin a message in a conversation. And return list of pinned message after pinning
 *
 * @async
 * @param {string} message_id - The message ID
 * @returns {Promise<IMessage>} - List of pinned messages in the conversation
 */
const pinMessage = async (message_id: string): Promise<IMessage[]> => {
  const message = await messageModel.findByIdAndUpdate(
    {
      _id: message_id,
    },
    {
      is_deleted: false,
      is_pinned: true,
    }
  );

  if (!message) {
    throw new UserInputError("Message not found!");
  }

  const pinnedMessages = await messageModel.find({
    conversation_id: message.conversation_id,
    is_pinned: true,
  });

  return pinnedMessages.map((message) => castToIMessage(message));
};

/**
 * Unpin a message in a conversation. And return list of pinned message after unpinning
 *
 * @async
 * @param {string} message_id - The message ID
 * @returns {Promise<IMessage[]>} - List of pinned messages in the conversation
 */
const unpinMessage = async (message_id: string): Promise<IMessage[]> => {
  const message = await messageModel.findByIdAndUpdate(
    {
      _id: message_id,
    },
    {
      is_deleted: false,
      is_pinned: false,
    }
  );

  if (!message) {
    throw new UserInputError("Message not found in the server/pinned list!");
  }

  const pinnedMessages = await messageModel.find({
    conversation_id: message.conversation_id,
    is_pinned: true,
  });

  return pinnedMessages.map((message) => castToIMessage(message));
};

// ==========================

const messageAPI: IResolvers = {
  Query: {
    message: async (_, { id }) => getMessage(id),
    messages: async (_, { conversation_id, limit, before, after, around }) =>
      getMessages(conversation_id, limit, before, after, around),
  },
  Mutation: {
    createMessage: async (_, { conversation_id, input }) =>
      createMessageTransaction(conversation_id, input),
    editMessage: async (_, { message_id, input }) =>
      updateMessageTransaction(message_id, input),
    deleteMessage: async (_, { message_id }) =>
      deleteMessageTransaction(message_id),
    pinMessage: async (_, { message_id }) => pinMessage(message_id),
    unpinMessage: async (_, { message_id }) => unpinMessage(message_id),
  },
};

const messageSubscription: IResolvers = {
  Subscription: {},
};

export default { API: messageAPI };
