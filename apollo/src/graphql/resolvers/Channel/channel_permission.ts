import mongoose, { Error, MongooseError } from "mongoose";
import { IResolvers } from "@graphql-tools/utils";
import { PubSub, withFilter } from "graphql-subscriptions";
import { AuthenticationError, UserInputError } from "apollo-server";

import ServerModel from "../../../models/server";
import ChannelModel from "../../../models/Channel/channel";
import ChannelPermissionModel from "../../../models/Channel/channel_permission";

const resolvers: IResolvers = {
  Query: {
    getChannelPermissions: async (_, { channel_id }) => {
      try {
        const permissions = await ChannelPermissionModel.find({ channel_id });
        return permissions;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  Mutation: {
    createChannelPermission: async (_, { channel_id, input }) => {
      try {
        const channel = await ChannelModel.findById(channel_id);
        if (!channel) {
          throw new Error("Channel not found!");
        }

        const permission = await ChannelPermissionModel.create({
          channel_id,
          ...input,
        });
        return permission;
      } catch (error) {
        throw new Error(error);
      }
    },
    updateChannelPermission: async (_, { channel_id, input }) => {
      try {
        const channelPermission = await ChannelPermissionModel.findById(
          channel_id
        );
        if (!channelPermission) {
          throw new Error("Channel Permission not found!");
        }

        const permission = await ChannelPermissionModel.findOneAndUpdate(
          { channel_id },
          input,
          { new: true }
        );
        return permission;
      } catch (error) {
        throw new Error(error);
      }
    },
    deleteChannelPermission: async (_, { id }) => {
      try {
        // Check if permission is @everyone
        const permission = await ChannelPermissionModel.findById(id);
        if (!permission) {
          throw new Error("Permission not found!");
        }
        if (!permission.server_role_id && permission.is_user === false) {
          throw new Error("Cannot delete @everyone permission");
        }

        await ChannelPermissionModel.findByIdAndDelete(id);
        return true;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};

export default resolvers;
