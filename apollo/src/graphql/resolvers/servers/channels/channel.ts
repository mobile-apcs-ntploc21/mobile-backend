import { IResolvers } from "@graphql-tools/utils";
import { UserInputError } from "apollo-server";
import mongoose from "mongoose";

import ConversationModel from "@/models/conversations/conversation";
import CategoryModel from "@/models/servers/channels/category";
import ChannelModel from "@/models/servers/channels/channel";
import ServerModel from "@/models/servers/server";
import MessageModel from "@/models/conversations/message";
import MentionModel from "@/models/conversations/mention";
import LastReadModel from "@/models/conversations/last_read";
import ChannelRolePermission from "@models/servers/channels/channel_role_permission";
import ChannelUserPermission from "@models/servers/channels/channel_user_permission";
import ServerRoleModel from "@models/servers/server_role";
import { defaultChannelRole } from "@resolvers/servers/channels/channel_role_permission";
import { publishEvent, ServerEvents } from "../../../pubsub/pubsub";

const POSITION_CONST = 1 << 20; // This is the constant used to calculate the position of the channel
const POSITION_GAP = 10; // This is the minimum gap between the position of the channels

const createChannelTransaction = async (server_id, input) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const opts = { session, new: true };

  const { name, category_id } = input;
  let position = 0;
  try {
    if (!ServerModel.findById(server_id).session(session)) {
      throw new UserInputError("Server not found");
    }
    if (!CategoryModel.findById(category_id).session(session)) {
      throw new UserInputError("Category not found");
    }

    // Calculate the last position of the category
    const category = await ChannelModel.find({
      server_id,
      category_id,
      is_deleted: false,
    }).session(session);
    position = category.length * POSITION_CONST;

    // Create a conversation chat for the channel
    const [conversation] = await ConversationModel.create([{}], opts);

    const channel = await ChannelModel.create(
      [
        {
          server_id,
          category_id: category_id,
          conversation_id: conversation.id,
          name,
          position,
        },
      ],
      opts
    );

    // Find the default server role and create a channel permission for it
    const default_server_role = await ServerRoleModel.findOne({
      server_id,
      default: true,
    });

    await ChannelRolePermission.create(
      [
        {
          _id: {
            server_role_id: default_server_role._id,
            channel_id: channel[0]._id,
          },
          permissions: defaultChannelRole,
        },
      ],
      opts
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return channel[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    throw error;
  }
};

const getChannels = async (user_id, server_id) => {
  const channels = await ChannelModel.find({
    server_id: server_id,
    is_deleted: false,
  }).lean();

  // Get the last message of each channel
  const conversationIds = channels.map((channel) => channel.conversation_id);
  const messages = await MessageModel.find({
    conversation_id: { $in: conversationIds },
  })
    .sort({ created_at: -1 })
    .lean();

  // Initialize the last read data
  let lastReadMap = {};
  let lastReadMessageMap = {};

  if (user_id && user_id !== null) {
    // Fetch the last read information for the user on these channels
    const lastReads = await LastReadModel.find({
      "_id.conversation_id": { $in: conversationIds },
      "_id.user_id": user_id,
    }).lean();

    // Create a map of conversation_id to the last read message
    lastReadMap = lastReads.reduce((acc, lr) => {
      acc[lr._id.conversation_id.toString()] = lr.last_message_read_id;
      return acc;
    }, {});

    // Fetch the last read messages from the database
    const lastReadMessages = await MessageModel.find({
      _id: { $in: Object.values(lastReadMap) },
    }).lean();

    // Create a map of conversation_id to the last read message timestamp
    lastReadMessageMap = lastReadMessages.reduce((acc, lr) => {
      acc[lr.conversation_id.toString()] = lr.createdAt;
      return acc;
    }, {});
  }

  // Map the last message to the corresponding channel
  const lastMessages = messages.reduce((acc, message) => {
    acc[String(message.conversation_id)] = message;
    return acc;
  }, {});

  const finalizedChannels = await Promise.all(
    channels.map(async (channel) => {
      const conversationId = (channel.conversation_id || "").toString();
      const lastMessage = lastMessages[conversationId] || null;
      const lastReadMessage = lastReadMessageMap[conversationId] || 0;

      // Check if the user has new messages in the channel
      let has_new_message = false;
      if (user_id && lastMessage) {
        has_new_message = lastMessage.createdAt > lastReadMessage;
      }

      // Check for unreaded mention in the channel
      let number_of_unread_mentions = 0;
      if (user_id && lastMessage) {
        const unreadMentions = await MentionModel.countDocuments({
          conversation_id: lastMessage.conversation_id,
          user_id: user_id,
          createdAt: { $gt: lastReadMessage },
        });

        number_of_unread_mentions = unreadMentions;
      }

      return {
        ...channel,
        id: channel._id,
        last_message: lastMessage,
        has_new_message,
        number_of_unread_mentions,
      };
    })
  );
  return finalizedChannels;
};

const moveChannelTransaction = async (
  server_id,
  channel_id,
  category_id,
  new_position
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const opts = { session, new: true };

  try {
    const channel = await ChannelModel.findById(channel_id).session(session);
    if (!channel || String(channel.server_id) !== server_id) {
      throw new UserInputError("Channel not found");
    }

    const category = await CategoryModel.findById(category_id).session(session);
    if (category && String(category.server_id) !== String(channel.server_id)) {
      throw new UserInputError("Category not found in the current server.");
    }

    // Calculate the position of the channel
    new_position = new_position * POSITION_CONST;

    // Update the channel
    channel.category_id = category_id;
    channel.position = new_position;
    await channel.save({ session });
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const syncChannelTransaction = async () => {
  // Begin the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get all the channels in the server
    const channels = await ChannelModel.find({
      is_deleted: false,
    }).session(session);

    // Create a conversation for each channel if not exists
    const conversationPromises = channels.map(async (channel) => {
      if (!channel.conversation_id) {
        const [conversation] = await ConversationModel.create([{}], {
          session,
        });
        channel.conversation_id = conversation.id;
        return channel.save({ session });
      }
    });

    await Promise.all(conversationPromises);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return true;
  } catch (error: any) {
    // Rollback the transaction
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const channelAPI: IResolvers = {
  Query: {
    getChannel: async (_, { channel_id }) => {
      const channel = await ChannelModel.findById(channel_id);

      if (!channel) {
        throw new UserInputError("Channel not found");
      }

      return channel;
    },
    getChannels: async (_, { user_id, server_id }) =>
      getChannels(user_id, server_id),
  },
  Mutation: {
    createChannel: async (_, { server_id, input }) => {
      const channel = await createChannelTransaction(server_id, input);

      publishEvent(ServerEvents.serverUpdated, {
        type: ServerEvents.channelAdded,
        server_id: server_id,
        data: {
          ...channel.toObject(),
        },
      });

      return channel;
    },
    updateChannel: async (_, { channel_id, input }) => {
      const channel = await ChannelModel.findByIdAndUpdate(
        channel_id,
        { $set: input },
        { new: true }
      );

      publishEvent(ServerEvents.serverUpdated, {
        type: ServerEvents.channelUpdated,
        server_id: channel.server_id,
        data: {
          ...channel.toObject(),
        },
      });

      return channel;
    },
    deleteChannel: async (_, { channel_id }) => {
      // This is a soft delete
      const channel = await ChannelModel.findByIdAndUpdate(
        channel_id,
        { is_deleted: true },
        { new: true }
      );

      publishEvent(ServerEvents.serverUpdated, {
        type: ServerEvents.channelDeleted,
        server_id: channel.server_id,
      });

      return true;
    },
    hardDeleteChannel: async (_, { channel_id }) => {
      // This is a hard delete
      try {
        const channel = await ChannelModel.findByIdAndDelete(channel_id);
        await ChannelRolePermission.deleteMany({
          "_id.channel_id": channel_id,
        });
        await ChannelUserPermission.deleteMany({
          "_id.channel_id": channel_id,
        });

        publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.channelDeleted,
          server_id: channel.server_id,
        });

        return true;
      } catch (error) {
        throw new UserInputError("Channel not found");
      }
    },

    moveChannel: async (_, { channel_id, category_id, new_position }) => {
      const channel = await ChannelModel.findById(channel_id);
      if (!channel) {
        throw new UserInputError("Channel not found");
      }

      const category = await CategoryModel.findById(category_id);
      if (
        category &&
        String(category.server_id) !== String(channel.server_id)
      ) {
        throw new UserInputError("Category not found in the current server.");
      }

      // Get all channel in the category and sort by position
      let channels = await ChannelModel.find({
        server_id: channel.server_id,
        category_id: category_id,
        is_deleted: false,
      }).sort({
        position: 1,
      });

      // Remove the current channel from the list
      channels = channels.filter((c) => c._id.toString() !== channel_id);

      // Normalize the new position
      new_position = Math.max(0, Math.min(new_position, channels.length));

      // Find the previous and next channel
      const previous_channel = channels[new_position - 1];
      const next_channel = channels[new_position];

      // Check if the channel is already in the correct position
      if (
        (previous_channel && previous_channel._id.toString() === channel_id) ||
        (next_channel && next_channel._id.toString() === channel_id)
      ) {
        return channel;
      }

      // Calculate the position of the channel
      let position = 0;
      if (previous_channel && next_channel) {
        // If the channel is in the middle
        position = (previous_channel.position + next_channel.position) / 2;

        // Normalize if the gap is too small
        if (next_channel.position - previous_channel.position <= POSITION_GAP) {
          channels.forEach(async (channel, index) => {
            channel.position = index * POSITION_CONST;
            await channel.save();
          });
        }
      } else if (previous_channel) {
        // If the channel is at the end
        position = previous_channel.position + POSITION_CONST;
      } else if (next_channel) {
        // If the channel is at the beginning
        position = next_channel.position - POSITION_CONST;
      } else {
        // If the channel is the only channel in the category
        position = 0;
      }

      // Update the channel
      channel.category_id = category_id;
      channel.position = position;
      await channel.save();

      publishEvent(ServerEvents.serverUpdated, {
        type: ServerEvents.channelUpdated,
        server_id: channel.server_id,
        data: {
          ...channels,
          ...channel.toObject(),
        },
      });

      return channel;
    },

    /**
     * Given a list of channels, move them to a new category with given position.
     * Assuming they give all the channels in the same server.
     * @param server_id: ID of the server
     * @param input: List of channels to move
     */
    moveAllChannel: async (_, { server_id, input }) => {
      // Check if all the channels are in the same server
      const channels = await ChannelModel.find({
        server_id: server_id,
        is_deleted: false,
      });

      if (channels.length !== input.length) {
        throw new UserInputError(
          "Please provide all the channels in the server. There are missing or extra channels."
        );
      }

      for (let i = 0; i < input.length; i++) {
        const channel = input[i];
        await moveChannelTransaction(
          server_id,
          channel.channel_id,
          channel.category_id,
          channel.position
        );
      }

      const updatedChannels = await ChannelModel.find({
        server_id: server_id,
        is_deleted: false,
      });

      // Publish the event
      publishEvent(ServerEvents.serverUpdated, {
        type: ServerEvents.channelUpdated,
        server_id: server_id,
        data: {
          ...updatedChannels,
        },
      });

      return updatedChannels;
    },
    syncChannel: async (_, {}) => {
      try {
        await syncChannelTransaction();

        return true;
      } catch (error) {
        return false;
      }
    },
  },
};

export default { API: channelAPI };
