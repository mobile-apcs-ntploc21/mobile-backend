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
import AssignedUserRoleModel from "@/models/servers/assigned_user_role";
import { publishEvent, ServerEvents } from "@/graphql/pubsub/pubsub";
import ServerRoleModel from "@/models/servers/server_role";

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
export const fetchExtraFields = async (messages: any[]): Promise<any> => {
  const messageIds = messages.map((message) => message._id);
  const senderIds = messages.map((msg) => msg.sender_id);
  const repliedMessageIds = messages
    .map((msg) => msg.replied_message_id)
    .filter(Boolean);

  // 1. Perform all the fetch operations in parallel to minimize blocking
  const [mentions, reactions, repliedMessages, senders] = await Promise.all([
    mentionModel.find({ message_id: { $in: messageIds } }).lean(),
    ReactionModel.aggregate([
      { $match: { message_id: { $in: messageIds } } },
      {
        $group: {
          _id: "$message_id",
          reactions: {
            $push: { emoji_id: "$emoji_id", reactors: "$sender_id" },
          },
        },
      },
      { $unwind: "$reactions" },
      {
        $group: {
          _id: {
            message_id: "$_id",
            emoji_id: "$reactions.emoji_id",
          },
          reactors: { $push: "$reactions.reactors" },
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
    ]),
    repliedMessageIds.length > 0
      ? messageModel.find({ _id: { $in: repliedMessageIds } }).lean()
      : Promise.resolve([]),
    UserProfileModel.find({ user_id: { $in: senderIds } }).lean(),
  ]);

  // 2. Process mentions
  const mentionUsersMap = new Map<string, string[]>();
  const mentionRolesMap = new Map<string, string[]>();
  const mentionChannelsMap = new Map<string, string[]>();

  mentions.forEach((mention) => {
    const messageId = String(mention.message_id);
    if (mention.mention_user_id) {
      if (!mentionUsersMap.has(messageId)) mentionUsersMap.set(messageId, []);
      mentionUsersMap.get(messageId).push(String(mention.mention_user_id));
    }
    if (mention.mention_role_id) {
      if (!mentionRolesMap.has(messageId)) mentionRolesMap.set(messageId, []);
      mentionRolesMap.get(messageId).push(String(mention.mention_role_id));
    }
    if (mention.mention_channel_id) {
      if (!mentionChannelsMap.has(messageId))
        mentionChannelsMap.set(messageId, []);
      mentionChannelsMap
        .get(messageId)
        .push(String(mention.mention_channel_id));
    }
  });

  // 3. Process reactions
  const reactionsMap = new Map<string, IMessageReaction[]>();
  reactions.forEach((reaction) => {
    const messageId = String(reaction._id);
    const reactionData = {
      emoji_id: String(reaction.emoji_id),
      count: reaction.count,
      reactors: reaction.reactors.map(String),
    };
    if (!reactionsMap.has(messageId)) reactionsMap.set(messageId, []);
    reactionsMap.get(messageId).push(reactionData);
  });

  // 4. Process replied messages
  const repliedMessagesMap = new Map<string, IMessage>();
  repliedMessages.forEach((msg) => {
    repliedMessagesMap.set(String(msg._id), {
      id: String(msg._id),
      conversation_id: String(msg.conversation_id),
      sender_id: String(msg.sender_id),
      content: msg.content,
      is_deleted: msg.is_deleted,
    });
  });

  // 5. Process senders
  const senderMap = new Map<string, IProfile>();
  senders.forEach((sender) => {
    senderMap.set(String(sender.user_id), {
      user_id: String(sender.user_id),
      username: sender.username,
      display_name: sender.display_name,
      avatar_url: sender.avatar_url,
    });
  });

  // 6. Process emojis for each message
  const emojis = messages.map((msg) => ({
    messageId: msg._id,
    emojis: getMatches(msg.content, emoji_regex, 2),
  }));

  // 7. Return the extra fields for each message
  return messages.map((msg) => ({
    id: String(msg._id),
    author: senderMap.get(String(msg.sender_id)) || null,
    mention_users: mentionUsersMap.get(String(msg._id)) || [],
    mention_roles: mentionRolesMap.get(String(msg._id)) || [],
    mention_channels: mentionChannelsMap.get(String(msg._id)) || [],
    emojis: emojis.find((e) => e.messageId === msg._id)?.emojis || [],
    reactions: reactionsMap.get(String(msg._id)) || [],
    replied_message:
      repliedMessagesMap.get(String(msg.replied_message_id)) || null,
  }));
};

/**
 * Cast a message to IMessage object
 *
 * @param {*} message - The message object
 * @param {?*} [extra] - Extra fields. If not provided, it will be initialized and fetched
 * @returns {IMessage}
 */
export const castToIMessage = async (
  message: any,
  extra?: any
): Promise<IMessage> => {
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

  const [extraFields] = await fetchExtraFields([message]);
  const messageData = await castToIMessage(message, extraFields);
  return messageData;
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
  } = input;
  let { replied_message_id, forwarded_message_id } = input;

  // Check if conversation ID exists
  const conversation = await conversationModel.findById(conversation_id);
  if (!conversation) {
    throw new UserInputError("Conversation/Chat not found!");
  }

  // Get the server ID
  const channel = await channelModel.findOne({
    conversation_id: conversation_id,
  });

  // Start a session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check whether the replied message exists in the conversation
    if (replied_message_id) {
      const repliedMessage = await messageModel
        .findById(replied_message_id)
        .lean();

      if (
        !repliedMessage ||
        String(repliedMessage.conversation_id) !== conversation_id
      ) {
        // Reset the replied message ID since it's invalid
        replied_message_id = null;
      }
    }

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

    const [extraFields] = await fetchExtraFields([message]);
    const messageData = await castToIMessage(message, extraFields);

    // Check if the message is a reply then publish the event of mention to that user
    if (replied_message_id) {
      const repliedMessage = messageData.replied_message;
      if (repliedMessage) {
        publishEvent(ServerEvents.messageMentionedUser, {
          server_id: channel.server_id,
          user_id: repliedMessage.sender_id,
          forceUser: true,
          type: ServerEvents.messageMentionedUser,
          data: {
            conversation_id,
            message_id: message._id,
          },
        });
      }
    }

    // If the current message from a server
    if (channel) {
      publishEvent(ServerEvents.messageAdded, {
        server_id: channel.server_id,
        type: ServerEvents.messageAdded,
        data: {
          conversation_id,
          message: messageData,
        },
      });

      // Publish mention event for users
      publishEvent(ServerEvents.messageMentionedUser, {
        server_id: channel.server_id,
        user_id: mention_users,
        forceUser: true,
        type: ServerEvents.messageMentionedUser,
        data: {
          conversation_id,
          message_id: message._id,
        },
      });

      if (mention_roles.length > 0) {
        // Get the set of users from list of roles
        const everyoneRoles = await ServerRoleModel.findOne({
          name: "@everyone",
          server_id: channel.server_id,
        });
        // Get all users from the mentioned roles except @everyone
        const roles = await AssignedUserRoleModel.find({
          "_id.server_role_id": {
            $in: mention_roles.filter(
              (role_id) => role_id !== String(everyoneRoles._id)
            ),
          },
        });
        const users = roles.map((role) => role._id.user_id);
        const uniqueUsers = [...new Set(users)];

        // Publish mention event for roles
        if (uniqueUsers.length > 0) {
          publishEvent(ServerEvents.messageMentionedRole, {
            server_id: channel.server_id,
            user_id: uniqueUsers,
            forceUser: true,
            type: ServerEvents.messageMentionedRole,
            data: {
              conversation_id,
              message_id: message._id,
            },
          });
        }
      }
    }

    return messageData;
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

    // Publish the message event (edited)
    const [extraFields] = await fetchExtraFields([message]);
    const messageData = await castToIMessage(message, extraFields);

    const channel = await channelModel.findOne({
      conversation_id: message.conversation_id,
    });

    if (channel) {
      publishEvent(ServerEvents.messageEdited, {
        server_id: channel.server_id,
        type: ServerEvents.messageEdited,
        data: {
          conversation_id: message.conversation_id,
          message: messageData,
        },
      });
    }

    return messageData;
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

    // Delete all mentions associated with the message
    await mentionModel.deleteMany({ message_id: message_id }, { session });

    // Update the latest message in the channel model
    const latestMessage = await messageModel
      .findOne({
        conversation_id: message.conversation_id,
        is_deleted: false,
      })
      .session(session)
      .sort({ _id: -1 })
      .lean();

    await channelModel.updateOne(
      {
        conversation_id: message.conversation_id,
      },
      {
        last_message_id: latestMessage?._id || null,
      },
      { session, new: true }
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Publish the message event (deleted)
    const channel = await channelModel.findOne({
      conversation_id: message.conversation_id,
    });

    if (channel) {
      publishEvent(ServerEvents.messageDeleted, {
        server_id: channel.server_id,
        type: ServerEvents.messageDeleted,
        data: {
          conversation_id: message.conversation_id,
          message_id: message_id,
          replied_message_id: message.replied_message_id,
        },
      });
    }
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

  // Publish the message event (pinned)
  const channel = await channelModel.findOne({
    conversation_id: message.conversation_id,
  });

  if (channel) {
    publishEvent(ServerEvents.messagePinAdded, {
      server_id: channel.server_id,
      type: ServerEvents.messagePinAdded,
      data: {
        conversation_id: message.conversation_id,
        message: message,
      },
    });
  }

  // Get all pinned messages
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

  // Publish the message event (unpinned)
  const channel = await channelModel.findOne({
    conversation_id: message.conversation_id,
  });

  publishEvent(ServerEvents.messagePinRemoved, {
    server_id: channel.server_id,
    type: ServerEvents.messagePinRemoved,
    data: {
      conversation_id: message.conversation_id,
      message_id: message._id,
    },
  });

  // Get all pinned messages
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
