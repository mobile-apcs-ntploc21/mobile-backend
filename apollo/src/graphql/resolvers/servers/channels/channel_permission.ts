import { Error } from "mongoose";
import { IResolvers } from "@graphql-tools/utils";

import ServerModel from "../../../../models/servers/server";
import ChannelModel from "../../../../models/servers/channels/channel";
import ChannelPermissionModel from "../../../../models/servers/channels/channel_permission";
import { ServerEvents, publishEvent } from "../../../pubsub/pubsub";

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
    updateChannelPermission: async (_, { permission_id, input }) => {
      try {
        const permission = await ChannelPermissionModel.findById(permission_id);

        if (!permission) {
          throw new Error("Permission not found!");
        }

        await ChannelPermissionModel.findByIdAndUpdate(permission_id, input);

        return await ChannelPermissionModel.findById(permission_id);
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
