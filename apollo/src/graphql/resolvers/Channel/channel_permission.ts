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
    deleteChannelPermission: async (_, { channel_id }) => {
      try {
        const permission = await ChannelPermissionModel.findOneAndDelete({
          channel_id,
        });
        return permission;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};

export default resolvers;
