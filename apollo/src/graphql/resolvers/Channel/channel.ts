import mongoose, { Error, MongooseError } from "mongoose";
import { IResolvers } from "@graphql-tools/utils";
import { PubSub, withFilter } from "graphql-subscriptions";
import { AuthenticationError, UserInputError } from "apollo-server";

import ServerModel from "../../../models/server";
import ChannelModel from "../../../models/Channel/channel";
import ChannelPermissionModel from "../../../models/Channel/channel_permission";
import CategoryModel from "../../../models/Channel/category";
import {
  getAsyncIterator,
  publishEvent,
  ServerEvents,
} from "../../pubsub/pubsub";

const POSITION_CONST = 1 << 20; // This is the constant used to calculate the position of the channel
const POSITION_GAP = 10; // This is the minimum gap between the position of the channels

const createChannelTransaction = async (server_id, input) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const opts = { session, new: true };

  const { name, category_id, is_private } = input;
  let position = 0;
  try {
    if (!ServerModel.findById(server_id).session(session)) {
      throw new UserInputError("Server not found");
    }
    if (!CategoryModel.findById(category_id).session(session)) {
      throw new UserInputError("Category not found");
    }

    // Calculate the last position of the category
    const category = await ChannelModel.find({ category_id }).session(session);
    position = category.length * POSITION_CONST;

    const channel = await ChannelModel.create(
      [
        {
          server_id,
          category_id,
          name,
          position,
          private: {
            is_private,
          },
        },
      ],
      opts
    );

    // TODO: Add channel permissions as @everyone role
    await ChannelPermissionModel.create(
      [
        {
          channel_id: channel[0]._id,
          server_role_id: null,
          is_user: false,
        },
      ],
      opts
    );

    await session.commitTransaction();
    session.endSession();

    return channel[0];
  } catch (error) {
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
    getChannels: async (_, { server_id }) => {
      const channels = await ChannelModel.find({ server_id });

      return channels;
    },
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
        const channel_permissions = await ChannelPermissionModel.deleteMany({
          channel_id,
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

    addPrivateChannelID: async (_, { channel_id, id, is_user }) => {
      const channel = await ChannelModel.findByIdAndUpdate(
        channel_id,
        {
          $addToSet: {
            [`private.${is_user ? "user_id" : "role_id"}`]: id,
          },
        },
        { new: true }
      );

      return channel;
    },
    removePrivateChannelID: async (_, { channel_id, id, is_user }) => {
      const channel = await ChannelModel.findByIdAndUpdate(
        channel_id,
        {
          $pull: {
            [`private.${is_user ? "user_id" : "role_id"}`]: id,
          },
        },
        { new: true }
      );

      return channel;
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
      const channels = await ChannelModel.find({ category_id }).sort({
        position: 1,
      });
      // Remove the current channel from the list
      channels.filter((c) => c._id.toString() !== channel_id);

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
  },
};

export default { API: channelAPI };
