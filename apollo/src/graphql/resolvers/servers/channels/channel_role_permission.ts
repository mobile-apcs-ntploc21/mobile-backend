import {IResolvers} from "@graphql-tools/utils";
import {UserInputError} from "apollo-server";
import ChannelRolePermission from "../../../../models/servers/channels/channel_role_permission"
import {
  GeneralChannelPermissions,
  MembershipPermissions,
  PermissionStates,
  TextChannelPermissions,
  VoiceChannelPermissions
} from "../../../../constants/permissions";
import mongoose, {ObjectId} from "mongoose";
import {publishEvent, ServerEvents} from "../../../pubsub/pubsub";
import ServerRoleModel from "../../../../models/servers/server_role";
import Channel from "../../../../models/servers/channels/channel";

export const defaultChannelRole = JSON.stringify({
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

const createChannelRole = async (role_id: ObjectId, channel_id: ObjectId,  permissions: String ) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  if (!permissions) {
    permissions = defaultChannelRole;
  }
  try {
    if (!ServerRoleModel.findById(role_id).session(session)) {
      throw new UserInputError("Server role not found");
    }

    if (!Channel.findById(channel_id).session(session)) {
      throw new UserInputError("Channel not found");
    }

    const channel_role = await ChannelRolePermission.create({
      role_id,
      channel_id,
      permissions,
    });

    await session.commitTransaction();
    await session.endSession();

    return channel_role;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();

    throw error;
  }
};

const channelRoleAPI: IResolvers = {
  Query: {
    syncChannelRolePermission: async (_, __, { user }) => {
      try {
        // empty
        return await ChannelRolePermission.find();
      } catch (err) {
        throw new UserInputError("Cannot sync channel permissions for roles!");
      }
    },
    getChannelRolePermission: async (_, { role_id, channel_id }) => {
      try {
        return await ChannelRolePermission.findOne({ role_id, channel_id });
      } catch (err) {
        throw new UserInputError("Cannot get channel permissions associated with this role!");
      }
    },
  },
  Mutation: {
    createChannelRolePermission: async (_, { role_id, channel_id, permissions }) => {
      const channel_role = await createChannelRole(role_id, channel_id, permissions);

      const server_role = await ServerRoleModel.findById(role_id);

      publishEvent(ServerEvents.serverUpdated, {
        type: ServerEvents.channelRoleAdded,
        server_id: server_role.server_id,
        data: {
          ...channel_role.toObject(),
        },
      });

      return channel_role;
    },
    updateChannelRolePermission: async (_, { role_id, channel_id, permissions }) => {
      const channel_role = await ChannelRolePermission.findOneAndUpdate(
        { role_id, channel_id },
        { permissions },
        { new: true }
      );

      const server_role = await ServerRoleModel.findById(role_id);

      publishEvent(ServerEvents.serverUpdated, {
        type: ServerEvents.channelRoleUpdated,
        server_id: server_role.server_id,
        data: {
          ...channel_role.toObject(),
        },
      });

      return channel_role;
    },
    deleteChannelRolePermission: async (_, { role_id, channel_id }) => {
      const channel_role = await ChannelRolePermission.findOneAndDelete({ role_id, channel_id });

      const server_role = await ServerRoleModel.findById(role_id);

      publishEvent(ServerEvents.serverUpdated, {
        type: ServerEvents.channelRoleDeleted,
        server_id: server_role.server_id,
        data: {
          ...channel_role.toObject(),
        },
      });

      return channel_role;
    },
  },
};

export default { API: channelRoleAPI };
