import mongoose, { Error, MongooseError } from "mongoose";
import { IResolvers } from "@graphql-tools/utils";
import { PubSub, withFilter } from "graphql-subscriptions";
import { AuthenticationError, UserInputError } from "apollo-server";

import ServerModel from "../../../models/server";
import ChannelModel from "../../../models/Channel/channel";
import ChannelPermissionModel from "../../../models/Channel/channel_permission";
import CategoryModel from "../../../models/Channel/category";

const createChannelTransaction = async (server_id, input) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const opts = { session, new: true };

  const { name, category_id, is_private } = input;
  let position = 0; // TODO: Get the last position from the category
  try {
    if (!ServerModel.findById(server_id).session(session)) {
      throw new UserInputError("Server not found");
    }

    const category = await ChannelModel.find({ category_id }).session(session);
    position = category.length;

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

      console.log(channel);

      return channel;
    },
    updateChannel: async (_, { channel_id, input }) => {
      const channel = await ChannelModel.findByIdAndUpdate(
        channel_id,
        { $set: input },
        { new: true }
      );

      return channel;
    },
    deleteChannel: async (_, { channel_id }) => {
      // This is a soft delete
      const channel = await ChannelModel.findByIdAndUpdate(
        channel_id,
        { is_deleted: true },
        { new: true }
      );

      return channel;
    },
    hardDeleteChannel: async (_, { channel_id }) => {
      // This is a hard delete
      try {
        const channel = await ChannelModel.findByIdAndDelete(channel_id);

        return channel;
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
      // Check if the new position is valid
      if (new_position === undefined || new_position < 0) {
        throw new UserInputError("Invalid position or not provided.");
      }

      // First get the old position
      let channel = await ChannelModel.findById(channel_id);
      const old_position = channel?.position;

      if (!channel) {
        throw new UserInputError("Channel not found");
      }

      // Fetch all channels in the old category
      let oldCategoryChannels = await ChannelModel.find({
        category_id: channel.category_id,
      });

      // Update positions in the old category
      for (let ch of oldCategoryChannels) {
        if (ch.position > old_position) {
          ch.position -= 1;
          await ch.save();
        }
      }

      // Fetch all channels in the new category
      let newCategoryChannels = await ChannelModel.find({
        category_id: category_id,
      });

      // Update positions in the new category
      for (let ch of newCategoryChannels) {
        if (ch.position >= new_position) {
          ch.position += 1;
          await ch.save();
        }
      }

      // Update the channel
      channel.position = new_position;
      channel.category_id = category_id;
      await channel.save();

      return channel;
    },
  },
};

export default { API: channelAPI };
