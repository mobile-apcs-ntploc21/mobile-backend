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
import AssignedUserRoleModel from "@models/servers/assigned_user_role";


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

    // check if server role is already assigned with the channel
    if (await ChannelRolePermission.exists({
      '_id.server_role_id': role_id,
      '_id.channel_id': channel_id
    })) {
      throw new UserInputError("Server role is already assigned to channel permissions!");
    }

    const channel_role = await ChannelRolePermission.create({
      _id: {
        server_role_id: role_id,
        channel_id,
      },
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
    getChannelRolesPermissions: async (_, { channel_id }) => {
      try {
        const channelRoles = await ChannelRolePermission.find({
          '_id.channel_id': channel_id,
        });

        return await Promise.all(channelRoles.map(async (role) => {
          const role_id = role._id.server_role_id;
          const serverRole = await ServerRoleModel.findById(role_id);
          const users = await AssignedUserRoleModel.find({'_id.server_role_id': role_id});

          return {
            id: serverRole._id,
            server_id: serverRole.server_id,
            name: serverRole.name,
            color: serverRole.color,
            position: serverRole.position,
            is_admin: serverRole.is_admin,
            allow_anyone_mention: serverRole.allow_anyone_mention,
            last_modified: serverRole.last_modified,
            number_of_users: users.length,
            permissions: role.permissions,
          };
        }));
      } catch (err) {
        throw new UserInputError("Cannot get channel permissions for roles!");
      }
    },
    getChannelRolePermission: async (_, { role_id, channel_id }) => {
      try {
        // check if role_id is valid
        const serverRole = await ServerRoleModel.findById(role_id);
        if (!serverRole) {
          throw new UserInputError("Server role not found!");
        }

        const channel_role = await ChannelRolePermission.findOne({
          '_id.server_role_id': role_id,
          '_id.channel_id': channel_id,
        });
        const users = await AssignedUserRoleModel.find({'_id.server_role_id': role_id});

        return {
          id: serverRole._id,
          server_id: serverRole.server_id,
          name: serverRole.name,
          color: serverRole.color,
          allow_anyone_mention: serverRole.allow_anyone_mention,
          position: serverRole.position,
          permissions: channel_role.permissions,
          is_admin: serverRole.is_admin,
          last_modified: serverRole.last_modified,
          number_of_users: users.length,
        };
      } catch (err) {
        throw new UserInputError("Cannot get channel permissions associated with this role!");
      }
    },
  },
  Mutation: {
    createChannelRolePermission: async (_, { role_id, channel_id, permissions }) => {
      try {
        const channel_role = await createChannelRole(role_id, channel_id, permissions);

        const server_role = await ServerRoleModel.findById(role_id);

        publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.channelRoleAdded,
          server_id: server_role.server_id,
          data: {
            ...channel_role.toObject(),
          },
        });

        const roles = await ChannelRolePermission.find({
          '_id.channel_id': channel_id
        });

        return await Promise.all(roles.map(async (role) => {
          const role_id = role._id.server_role_id;
          const serverRole = await ServerRoleModel.findById(role_id);
          const users = await AssignedUserRoleModel.find({'_id.server_role_id': role_id});

          return {
            id: serverRole._id,
            server_id: serverRole.server_id,
            name: serverRole.name,
            color: serverRole.color,
            allow_anyone_mention: serverRole.allow_anyone_mention,
            position: serverRole.position,
            permissions: serverRole.permissions,
            is_admin: serverRole.is_admin,
            default: serverRole.default,
            last_modified: serverRole.last_modified,
            number_of_users: users.length,
          };
        }));
      } catch (error) {
        throw new UserInputError(error.message);
      }
    },
    updateChannelRolePermission: async (_, { role_id, channel_id, permissions }) => {
      try {
        const channel_role = await ChannelRolePermission.findOneAndUpdate(
          {
            '_id.server_role_id': role_id,
            '_id.channel_id': channel_id
          },
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

        const users = await AssignedUserRoleModel.find({'_id.server_role_id': role_id});

        return {
          id: server_role._id,
          server_id: server_role.server_id,
          name: server_role.name,
          color: server_role.color,
          allow_anyone_mention: server_role.allow_anyone_mention,
          position: server_role.position,
          permissions: channel_role.permissions,
          is_admin: server_role.is_admin,
          default: server_role.default,
          last_modified: server_role.last_modified,
          number_of_users: users.length,
        };
      } catch (error) {
        throw new UserInputError("Cannot update channel permissions for role!");
      }
    },
    deleteChannelRolePermission: async (_, { role_id, channel_id }) => {
      try {
        // check if the current role is a default role, if yes, throw an error
        const serverRole = await ServerRoleModel.findById(role_id);
        if (serverRole.default) {
          throw new UserInputError("Cannot delete default server role!");
        }

        const channel_role = await ChannelRolePermission.findOneAndDelete({
          '_id.server_role_id': role_id,
          '_id.channel_id': channel_id
        });

        const server_role = await ServerRoleModel.findById(role_id);

        publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.channelRoleDeleted,
          server_id: server_role.server_id,
          data: {
            ...channel_role.toObject(),
          },
        });

        const roles = await ChannelRolePermission.find({
          '_id.channel_id': channel_id
        });

        return await Promise.all(roles.map(async (role) => {
          const role_id = role._id.server_role_id;
          const serverRole = await ServerRoleModel.findById(role_id);
          const users = await AssignedUserRoleModel.find({'_id.server_role_id': role_id});

          return {
            id: serverRole._id,
            server_id: serverRole.server_id,
            name: serverRole.name,
            color: serverRole.color,
            allow_anyone_mention: serverRole.allow_anyone_mention,
            position: serverRole.position,
            permissions: serverRole.permissions,
            is_admin: serverRole.is_admin,
            default: serverRole.default,
            last_modified: serverRole.last_modified,
            number_of_users: users.length,
          };
        }));
      } catch (error) {
        throw new UserInputError("Cannot delete channel permissions for role!");
      }  
    },
  },
};

export default { API: channelRoleAPI };
