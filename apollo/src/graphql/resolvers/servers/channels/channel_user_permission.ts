import {IResolvers} from "@graphql-tools/utils";
import {UserInputError} from "apollo-server";
import ChannelUserPermission from "../../../../models/servers/channels/channel_user_permission"
import {
  GeneralChannelPermissions,
  MembershipPermissions,
  PermissionStates,
  TextChannelPermissions,
  VoiceChannelPermissions
} from "../../../../constants/permissions";
import mongoose, {ObjectId} from "mongoose";
import {publishEvent, ServerEvents} from "../../../pubsub/pubsub";
import Channel from "../../../../models/servers/channels/channel";
import UserModel from "../../../../models/user";

export const defaultChannelUserPermission = JSON.stringify({
  // General Channel Permissions
  [GeneralChannelPermissions.VIEW_CHANNEL]: PermissionStates.DEFAULT,
  [GeneralChannelPermissions.MANAGE_CHANNEL]: PermissionStates.DEFAULT,

  // Text Channel Permissions
  [TextChannelPermissions.SEND_MESSAGE]: PermissionStates.DEFAULT,
  [TextChannelPermissions.ATTACH_FILE]: PermissionStates.DEFAULT,
  [TextChannelPermissions.ADD_REACTION]: PermissionStates.DEFAULT,
  [TextChannelPermissions.USE_EXTERNAL_EMOJI]: PermissionStates.DEFAULT,
  [TextChannelPermissions.MENTION_ALL]: PermissionStates.DEFAULT,
  [TextChannelPermissions.MANAGE_MESSAGE]: PermissionStates.DEFAULT,

  // Voice Channel Permissions
  [VoiceChannelPermissions.VOICE_CONNECT]: PermissionStates.DEFAULT,
  [VoiceChannelPermissions.VOICE_SPEAK]: PermissionStates.DEFAULT,
  [VoiceChannelPermissions.VOICE_VIDEO]: PermissionStates.DEFAULT,
  [VoiceChannelPermissions.VOICE_MUTE_MEMBER]: PermissionStates.DEFAULT,
  [VoiceChannelPermissions.VOICE_DEAFEN_MEMBER]: PermissionStates.DEFAULT,
});

const createChannelUserPermission = async (user_id: ObjectId, channel_id: ObjectId,  permissions: String ) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  if (!permissions) {
    permissions = defaultChannelUserPermission;
  }
  try {
    if (!UserModel.findById(user_id).session(session)) {
      throw new UserInputError("User not found");
    }

    if (!Channel.findById(channel_id).session(session)) {
      throw new UserInputError("Channel not found");
    }

    const channel_user_permission = await ChannelUserPermission.create({
      user_id,
      channel_id,
      permissions,
    });

    await session.commitTransaction();
    await session.endSession();

    return channel_user_permission;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();

    throw error;
  }
};

const channelUserPermissionAPI: IResolvers = {
  Query: {
    syncChannelUserPermission: async (_, __, { user }) => {
      try {
        // empty
        return await ChannelUserPermission.find();
      } catch (err) {
        throw new UserInputError("Cannot sync channel permissions for users!");
      }
    },
    getChannelUserPermission: async (_, { user_id, channel_id }) => {
      try {
        return await ChannelUserPermission.findOne({ user_id, channel_id });
      } catch (err) {
        throw new UserInputError("Cannot get channel permissions associated with this user!");
      }
    },
  },
  Mutation: {
    createChannelUserPermission: async (_, { user_id, channel_id, permissions }) => {
      const channel_user_permission = await createChannelUserPermission(user_id, channel_id, permissions);

      const channel = await Channel.findById(channel_id);

      publishEvent(ServerEvents.serverUpdated, {
        type: ServerEvents.channelUserAdded,
        server_id: channel.server_id,
        data: {
          ...channel_user_permission.toObject(),
        },
      });

      return channel_user_permission;
    },
    updateChannelUserPermission: async (_, { user_id, channel_id, permissions }) => {
      const channel_user_permission = await ChannelUserPermission.findOneAndUpdate(
        { user_id, channel_id },
        { permissions },
        { new: true }
      );

      const channel = await Channel.findById(channel_id);

      publishEvent(ServerEvents.serverUpdated, {
        type: ServerEvents.channelUserUpdated,
        server_id: channel.server_id,
        data: {
          ...channel_user_permission.toObject(),
        },
      });

      return channel_user_permission;
    },
    deleteChannelUserPermission: async (_, { user_id, channel_id }) => {
      const channel_user_permission = await ChannelUserPermission.findOneAndDelete({ user_id, channel_id });

      const channel = await Channel.findById(channel_id);

      publishEvent(ServerEvents.serverUpdated, {
        type: ServerEvents.channelUserDeleted,
        server_id: channel.server_id,
        data: {
          ...channel_user_permission.toObject(),
        },
      });

      return channel_user_permission;
    },
  },
};

export default { API: channelUserPermissionAPI };
