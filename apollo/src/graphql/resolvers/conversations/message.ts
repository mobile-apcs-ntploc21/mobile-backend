import { IResolvers } from "@graphql-tools/utils";
import { UserInputError } from "apollo-server";
import mongoose from "mongoose";

import UserProfileModel from "@/models/user_profile";
import serverModel from "@models/servers/server";
import channelModel from "@models/servers/channels/channel";
import messageModel from "@models/conversations/message";
import conversationModel from "@models/conversations/conversation";
import mentionModel from "@/models/conversations/mention";
import attachmentModel from "@models/conversations/attachment";
import MentionModel from "@/models/conversations/mention";
import ReactionModel from "@/models/conversations/reaction";

// ==========================
interface IMessageReaction {
  emoji_id: string;
  count: number;
  reactors: string[];
}

interface IProfile {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

interface IMessage {
  id: string;

  conversation_id: string;
  sender_id: string;
  author?: IProfile;

  content: string;
  replied_message_id?: string;
  forwarded_message_id?: string;

  mention_users?: string[];
  mention_roles?: string[];
  mention_channels?: string[];
  emojis?: string[];
  reactions?: IMessageReaction[];
  replied_message?: IMessage;

  is_deleted?: boolean;
  is_pinned?: boolean;
  is_modified?: boolean;
  createdAt?: Date;
}

interface ISearchQuery {
  inConversation: string[];
  inChannel?: string[];
  text?: string;
  from?: string;
  mention?: string;
  has?: string;
}

// ==========================

const emoji_regex = /<:(.*?):([a-f0-9]{24})>/g;

function getMatches(string: string, regex: RegExp, index: number) {
  const matches = [];
  let match;
  while ((match = regex.exec(string))) {
    matches.push(match[index]);
  }
  return matches;
}

// ==========================

/**
 * This will fetch extra fields of all messages at once
 * And return them into mention_users, mention_roles, mention_channels, emojis, and reactions
 *
 * @async
 * @param {any[]} messages - The list of messages
 * @returns {Promise<any>} - The extra fields
 */
const fetchExtraFields = async (messages: any[]): Promise<any> => {
  const messageIds = messages.map((message) => message._id);

  // 1. Fetch the mentions of the messages
  const mentions = await mentionModel
    .find({ message_id: { $in: messageIds } })
    .lean();
  const mentionUsersMap = new Map<string, string[]>();
  const mentionRolesMap = new Map<string, string[]>();
  const mentionChannelsMap = new Map<string, string[]>();

  mentions.forEach((mention) => {
    if (mention.mention_user_id) {
      if (!mentionUsersMap.has(String(mention.message_id)))
        mentionUsersMap.set(String(mention.message_id), []);
      mentionUsersMap
        .get(String(mention.message_id))
        .push(String(mention.mention_user_id));
    }
    if (mention.mention_role_id) {
      if (!mentionRolesMap.has(String(mention.message_id)))
        mentionRolesMap.set(String(mention.message_id), []);
      mentionRolesMap
        .get(String(mention.message_id))
        .push(String(mention.mention_role_id));
    }
    if (mention.mention_channel_id) {
      if (!mentionChannelsMap.has(String(mention.message_id)))
        mentionChannelsMap.set(String(mention.message_id), []);
      mentionChannelsMap
        .get(String(mention.message_id))
        .push(String(mention.mention_channel_id));
    }
  });

  // 2. Update emojis for all messages
  const emojis = messages.map((msg) => ({
    messageId: msg._id,
    emojis: getMatches(msg.content, emoji_regex, 2),
  }));

  // 3. Fetch the reactions of the messages
  const reactionsMap = new Map<string, IMessageReaction[]>();
  try {
    const reactions = await ReactionModel.aggregate([
      { $match: { message_id: { $in: messageIds } } },
      {
        $group: {
          _id: "$message_id",
          reactions: {
            $push: {
              emoji_id: "$emoji_id",
              reactors: "$sender_id",
            },
          },
        },
      },
      {
        $unwind: "$reactions",
      },
      {
        $group: {
          _id: {
            message_id: "$_id",
            emoji_id: "$reactions.emoji_id",
          },
          reactors: {
            $push: "$reactions.reactors",
          },
        },
      },
      {
        $project: {
          _id: "$_id.message_id",
          emoji_id: "$_id.emoji_id",
          reactors: 1,
          count: { $size: "$reactors" },
        },
      },
    ]);

    reactions.forEach((reaction) => {
      const reactionData = {
        emoji_id: String(reaction.emoji_id),
        count: reaction.count,
        reactors: reaction.reactors.map((r) => String(r)),
      };
      const messageId = String(reaction._id);

      if (!reactionsMap.has(messageId)) {
        reactionsMap.set(messageId, []);
      }
      reactionsMap.get(messageId).push(reactionData);
    });
  } catch (e) {
    console.log(e);
    // Handle error
  }

  // 4. Fetch the replied messages
  const repliedMessagesMap = new Map<string, IMessage>();
  const repliedMessageIds = messages
    .map((msg) => msg.replied_message_id)
    .filter(Boolean);
  if (repliedMessageIds.length > 0) {
    const repliedMessages = await messageModel
      .find({ _id: { $in: repliedMessageIds } })
      .lean();

    repliedMessages.forEach((msg) => {
      repliedMessagesMap.set(String(msg._id), {
        id: String(msg._id),
        conversation_id: String(msg.conversation_id),
        sender_id: String(msg.sender_id),
        content: msg.content,
        is_deleted: msg.is_deleted,
      });
    });
  }

  // 5. Fetch the user profile of the senders
  const senderIds = messages.map((msg) => msg.sender_id);
  const senders = await UserProfileModel.find({
    user_id: { $in: senderIds },
  }).lean();
  const senderMap = new Map<string, IProfile>();
  senders.forEach((sender) => {
    senderMap.set(String(sender.user_id), {
      user_id: String(sender.user_id),
      username: sender.username,
      display_name: sender.display_name,
      avatar_url: sender.avatar_url,
    });
  });

  // 6. Return the extra fields
  return messages.map((msg) => ({
    author: senderMap.get(String(msg.sender_id)) || null,
    mention_users: mentionUsersMap.get(String(msg._id)) || [],
    mention_roles: mentionRolesMap.get(String(msg._id)) || [],
    mention_channels: mentionChannelsMap.get(String(msg._id)) || [],
    emojis: emojis.find((e) => e.messageId === msg._id)?.emojis || [],
    reactions: reactionsMap.get(String(msg._id)) || [],
    replied_message: repliedMessagesMap.get(String(msg.replied_message_id)),
  }));
};

/**
 * Cast a message to IMessage object
 *
 * @param {*} message - The message object
 * @param {?*} [extra] - Extra fields. If not provided, it will be initialized and fetched
 * @returns {IMessage}
 */
const castToIMessage = async (message: any, extra?: any): Promise<IMessage> => {
  if (!message) {
    throw new UserInputError("Message not found!");
  }

  let mention_users = extra?.mention_users || []; // List of user IDs
  let mention_roles = extra?.mention_roles || []; // List of role IDs
  let mention_channels = extra?.mention_channels || []; // List of channel IDs
  let emojis = extra?.emojis || []; // List of emoji IDs
  let reactions: IMessageReaction[] = extra?.reactions || []; // List of reactions
  let replied_message: IMessage = extra?.replied_message || null; // Replied message

  // Fetch the replied message
  if (message.replied_message_id && message.replied_message_id !== null) {
    try {
      const repliedMessage = await messageModel.findById(
        message.replied_message_id
      );

      if (repliedMessage) {
        replied_message = {
          id: repliedMessage.id,
          conversation_id: String(repliedMessage.conversation_id),
          sender_id: String(repliedMessage.sender_id),
          content: repliedMessage.content,
          is_deleted: repliedMessage.is_deleted,
        };
      }
    } catch (e) {
      // Do nothing
    }
  }

  // Return the message
  return {
    id: String(message._id || message.id),
    conversation_id: String(message.conversation_id),
    sender_id: String(message.sender_id),
    author: extra?.author || null,

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
    is_modified: message.is_modified,
    createdAt: message.createdAt,
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
  const message = await messageModel.findById(id).lean();
  if (!message || message.is_deleted) {
    throw new UserInputError("Message not found or has been deleted!");
  }
  return castToIMessage(message, fetchExtraFields([message])[0]);
};

/**
 * Get all messages, given limit, before, after, or around a message.
 * If multiple arguments are provided, the priority is before > after > around
 *
 * @async
 * @param {string} conversation_id - The conversation ID
 * @param {number} limit - The limit of messages to return. Automatically capped at 100
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
  // Fix the limit range to [1; 100]
  limit = Math.min(Math.max(limit, 1), 100);

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
      .limit(limit)
      .lean();
  } else if (after) {
    messages = await messageModel
      .find({
        conversation_id,
        is_deleted: false,
        _id: { $gt: after },
      })
      .sort({ _id: 1 })
      .limit(limit)
      .lean();
  } else if (around) {
    const halfLimit = Math.floor(limit / 2);
    const upper = await messageModel
      .find({
        conversation_id,
        is_deleted: false,
        _id: { $gt: around },
      })
      .sort({ _id: 1 })
      .limit(halfLimit)
      .lean();
    const lower = await messageModel
      .find({
        conversation_id,
        is_deleted: false,
        _id: { $lt: around },
      })
      .sort({ _id: -1 })
      .limit(limit - halfLimit)
      .lean();

    messages = [...lower, ...upper];
  } else {
    // Get the latest messages
    messages = await messageModel
      .find({
        conversation_id,
        is_deleted: false,
      })
      .sort({ _id: -1 })
      .limit(limit)
      .lean();
  }

  // Cast the messages to IMessage
  const extraFields = await fetchExtraFields(messages);
  return Promise.all(
    messages.map((message, index) =>
      castToIMessage(message, extraFields[index])
    )
  );
};

/**
 * Search messages in a server (or in a conversation) based on the given query
 *
 * @async
 * @param {ISearchQuery} [query] - The search query. Contains inConversation, text, from, mention, and has
 * @param {number} offset - The offset (used for pagination)
 * @param {number} limit - The limit of messages to return. Automatically capped at 100
 * @returns {Promise<IMessage[]>} - Array of messages that match the search query
 */
const searchMessages = async (
  query: ISearchQuery,

  offset: number,
  limit: number
): Promise<IMessage[]> => {
  // Fix the limit range to [1; 100]
  limit = Math.min(Math.max(limit, 1), 100);

  // Initialize the messages array and query
  let messages = [];
  const messageQuery: any = {
    is_deleted: false, // Only get messages that are not deleted
  };
  const { inConversation, inChannel, text, from, mention, has } = query;

  // 0. If given inChannel, then convert it to inConversation
  let convertsationIds: string[] = inConversation;
  if (inChannel && inChannel.length > 0) {
    const channels = await channelModel.find({ _id: { $in: inChannel } });
    convertsationIds = [
      ...convertsationIds,
      ...channels.map((c) => String(c.conversation_id)),
    ];
  }

  // TODO: If this is empty then do a global search
  if (convertsationIds.length === 0) {
    throw new UserInputError("No conversation specified for search!");
  }

  // 1. Filter by conversation (if provided)
  if (convertsationIds && convertsationIds.length > 0) {
    messageQuery.conversation_id = { $in: convertsationIds };
  }

  // 2. Filter by text
  if (text) {
    // Using text index for searching
    messageQuery.$text = { $search: text };
  }

  // 3. Filter by sender
  if (from) {
    messageQuery.sender_id = from;
  }

  // 4. Filter by mention
  if (mention) {
    const mentions = await MentionModel.find({ mention_user_id: mention });
    messageQuery._id = { $in: mentions.map((mention) => mention.message_id) };
  }

  // 5. Filter by attachment (TODO)
  if (has) {
    // const attachments = await AttachmentModel.find({ attachment_id: has });
  }

  // Execute the query with pagination
  messages = await messageModel
    .find(messageQuery)
    .sort({ _id: -1 })
    .skip(offset)
    .limit(limit)
    .lean();

  // Cast the messages to IMessage
  const extraFields = await fetchExtraFields(messages);
  return Promise.all(
    messages.map((message, index) =>
      castToIMessage(message, extraFields[index])
    )
  );
};

/**
 * Get all pinned messages from a conversation
 *
 * @async
 * @param {string} conversation_id - The conversation ID
 * @returns {Promise<IMessage[]>} - Array of pinned messages
 */
const getPinnedMessages = async (
  conversation_id: string
): Promise<IMessage[]> => {
  const conversation = await conversationModel.findById(conversation_id);
  if (!conversation) {
    throw new UserInputError("Conversation/Chat not found!");
  }

  const messages = await messageModel
    .find({
      conversation_id,
      is_deleted: false,
      is_pinned: true,
    })
    .lean();

  return await Promise.all(messages.map((message) => castToIMessage(message)));
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
          replied_message_id: replied_message_id || null,
          forwarded_message_id: forwarded_message_id || null,
        },
      ],
      { session, new: true }
    );

    if (!message) {
      throw new UserInputError("Message not created. Try again later!");
    }

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

    // Update the last message in the channel model
    await channelModel.updateOne(
      {
        conversation_id: conversation_id,
      },
      {
        last_message_id: message._id,
      },
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
    // Update the message content and is_modified flag
    const message = await messageModel.findByIdAndUpdate(
      message_id,
      { content: content, is_modified: true },
      { session, new: true }
    );

    if (!message) {
      throw new UserInputError("Message not found or cannot be update!");
    }

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

  return await Promise.all(
    pinnedMessages.map((message) => castToIMessage(message))
  );
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

  const pinnedIMessages = await Promise.all(
    pinnedMessages.map((message) => castToIMessage(message))
  );

  return pinnedIMessages;
};

// ==========================

const messageAPI: IResolvers = {
  Query: {
    message: async (_, { message_id }) => getMessage(message_id),
    messages: async (_, { conversation_id, limit, before, after, around }) =>
      getMessages(conversation_id, limit, before, after, around),

    searchMessages: async (_, { query, offset, limit }) =>
      searchMessages(query, offset, limit),

    pinnedMessages: async (_, { conversation_id }) =>
      getPinnedMessages(conversation_id),
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
