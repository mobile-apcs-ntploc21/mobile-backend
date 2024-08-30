import {IResolvers} from "@graphql-tools/utils";
import {UserInputError} from "apollo-server";
import ServerRoleModel from "../../../models/servers/server_role";
import {
  GeneralServerPermissions,
  MembershipPermissions,
  PermissionStates,
  TextChannelPermissions,
  VoiceChannelPermissions
} from "../../../constants/permissions";
import ServerModel from "../../../models/servers/server";
import mongoose, {ObjectId} from "mongoose";
import {publishEvent, ServerEvents} from "./../../pubsub/pubsub";
import AssignedUserRoleModel from "../../../models/servers/assigned_user_role";

export const defaultServerRole = JSON.stringify({
  // General Server Permissions
  [GeneralServerPermissions.CREATE_EXPRESSION]: PermissionStates.DENIED,
  [GeneralServerPermissions.MANAGE_EXPRESSION]: PermissionStates.DENIED,
  [GeneralServerPermissions.MANAGE_SERVER]: PermissionStates.DENIED,
  [GeneralServerPermissions.VIEW_CHANNEL]: PermissionStates.ALLOWED,
  [GeneralServerPermissions.MANAGE_CHANNEL]: PermissionStates.DENIED,

  // Membership Permissions
  [MembershipPermissions.MANAGE_INVITE]: PermissionStates.DENIED,
  [MembershipPermissions.KICK_MEMBER]: PermissionStates.DENIED,
  [MembershipPermissions.BAN_MEMBER]: PermissionStates.DENIED,

  // Text Channel Permissions
  [TextChannelPermissions.SEND_MESSAGE]: PermissionStates.ALLOWED,
  [TextChannelPermissions.ATTACH_FILE]: PermissionStates.ALLOWED,
  [TextChannelPermissions.ADD_REACTION]: PermissionStates.ALLOWED,
  [TextChannelPermissions.USE_EXTERNAL_EMOJI]: PermissionStates.ALLOWED,
  [TextChannelPermissions.MENTION_ALL]: PermissionStates.ALLOWED,
  [TextChannelPermissions.MANAGE_MESSAGE]: PermissionStates.DENIED,

  // Voice Channel Permissions
  [VoiceChannelPermissions.VOICE_CONNECT]: PermissionStates.ALLOWED,
  [VoiceChannelPermissions.VOICE_SPEAK]: PermissionStates.ALLOWED,
  [VoiceChannelPermissions.VOICE_VIDEO]: PermissionStates.ALLOWED,
  [VoiceChannelPermissions.VOICE_MUTE_MEMBER]: PermissionStates.DENIED,
  [VoiceChannelPermissions.VOICE_DEAFEN_MEMBER]: PermissionStates.DENIED,
});

const POSITION_CONST = 1 << 20; // This is the constant used to calculate the position of the channel
const POSITION_GAP = 10; // This is the minimum gap between the position of the channels

const createServerRole = async (server_id: ObjectId, input: { name: String; color: String; allow_anyone_mention: String; permissions: String; is_admin: String; default_: String }) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const opts = { session, new: true };

  let { name, color, allow_anyone_mention, permissions, is_admin, default_ } = input;
  let position = 0;
  if (!permissions) {
    permissions = defaultServerRole;
  }

  try {
    if (!ServerModel.findById(server_id).session(session)) {
      throw new UserInputError("Server not found");
    }

    // Calculate the last position of the category
    const roles = await ServerRoleModel.find({ server_id }).session(session);
    position = roles.length * POSITION_CONST;

    const server_role = await ServerRoleModel.create(
      [
        {
          server_id,
          name,
          color,
          allow_anyone_mention,
          position,
          permissions,
          is_admin,
          default: default_
        },
      ],
      opts
    );

    await session.commitTransaction();
    session.endSession();

    return server_role[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    throw error;
  }
};

const serverRoleAPI: IResolvers = {
  Query: {
    syncServerRole: async (_, __, { user }) => {
      try {
        // empty
        return await ServerRoleModel.find();
      } catch (err) {
        throw new UserInputError("Cannot sync server roles!");
      }
    },
    getServerRole: async (_, { role_id }) => {
      const serverRole = await ServerRoleModel.findById(role_id);
      if (!serverRole) {
        // throw new UserInputError("Server role not found!");
        return null;
      }
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
        number_of_users: users.length
      }
    },
    getServerRoles: async (_, { server_id }) => {
      // check if server_id is valid
      if (!ServerModel.findById(server_id)) {
        // throw new UserInputError("Server not found!");
        return null;
      }

      const serverRoles = await ServerRoleModel.find({ server_id });

      return serverRoles.map(async (serverRole) => {
        const users = await AssignedUserRoleModel.find({'_id.server_role_id': serverRole._id});

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
      });
    },
    getDefaultServerRole: async (_, { server_id }) => {
      // check if server_id is valid
      if (!ServerModel.findById(server_id)) {
        throw new UserInputError("Server not found!");
        return null;
      }

      const serverRole = await ServerRoleModel.findOne({ server_id, default: true });
      if (!serverRole) {
        throw new UserInputError("Default server role not found!");
        return null;
      }

      const users = await AssignedUserRoleModel.find({'_id.server_role_id': serverRole._id});

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
        number_of_users: users.length
      }
    },
  },
  Mutation: {
    createServerRole: async (_, { server_id, input }) => {
      const server_role = await createServerRole(server_id, {
        ...input,
        default_: false
      });

      publishEvent(ServerEvents.serverUpdated, {
        type: ServerEvents.roleAdded,
        server_id: server_id,
        data: {
          ...server_role.toObject(),
        },
      });

      return {
        id: server_role._id,
        server_id: server_role.server_id,
        name: server_role.name,
        color: server_role.color,
        allow_anyone_mention: server_role.allow_anyone_mention,
        position: server_role.position,
        permissions: server_role.permissions,
        is_admin: server_role.is_admin,
        default: server_role.default,
        last_modified: server_role.last_modified,
        number_of_users: 0
      }
    },
    updateServerRole: async (_, { role_id, input }) => {
      const server_role = await ServerRoleModel.findOneAndUpdate(
        {
          '_id': role_id,
          'default': false
        },
        { $set: input },
        { new: true }
      );

      if (!server_role) {
        throw new UserInputError("Server role not found!");
      }

      const users = await AssignedUserRoleModel.find({'_id.server_role_id': role_id});

      publishEvent(ServerEvents.serverUpdated, {
        type: ServerEvents.roleUpdated,
        server_id: server_role.server_id,
        data: {
          ...server_role.toObject(),
        },
      });

      return {
        id: server_role._id,
        server_id: server_role.server_id,
        name: server_role.name,
        color: server_role.color,
        allow_anyone_mention: server_role.allow_anyone_mention,
        position: server_role.position,
        permissions: server_role.permissions,
        is_admin: server_role.is_admin,
        default: server_role.default,
        last_modified: server_role.last_modified,
        number_of_users: users.length
      }
    },
    updateDefaultServerRole: async (_, { server_id, input }) => {
      const server_role = await ServerRoleModel.findOneAndUpdate(
        {
          'server_id': server_id,
          'default': true
        },
        { $set: input },
        { new: true }
      );

      if (!server_role) {
        throw new UserInputError("Default server role not found!");
      }

      const users = await AssignedUserRoleModel.find({'_id.server_role_id': server_role._id});

      publishEvent(ServerEvents.serverUpdated, {
        type: ServerEvents.roleUpdated,
        server_id: server_role.server_id,
        data: {
          ...server_role.toObject(),
        },
      });

      return {
        id: server_role._id,
        server_id: server_role.server_id,
        name: server_role.name,
        color: server_role.color,
        allow_anyone_mention: server_role.allow_anyone_mention,
        position: server_role.position,
        permissions: server_role.permissions,
        is_admin: server_role.is_admin,
        default: server_role.default,
        last_modified: server_role.last_modified,
        number_of_users: users.length
      }
    },
    deleteServerRole: async (_, { role_id }) => {
      // note: when we delete server role, we also need to remove the role if it is assigned to any user
      // note: we also need to remove the role from all channels, if it is assigned to any channel
      // note: we also need to remove the role from all categories, if it is assigned to any category

      const server_role = await ServerRoleModel.findOneAndDelete({ '_id': role_id, 'default': false });
      if (!server_role) {
        throw new UserInputError("Server role not found!");
      }

      let deletedUsers = 0;
      try {
        // delete the role from all users
        const result = await AssignedUserRoleModel.deleteMany({ '_id.server_role_id': role_id });
        deletedUsers = result.deletedCount;
      } catch (err) {
        throw new UserInputError("Cannot delete server role from users!");
      }

      publishEvent(ServerEvents.serverUpdated, {
        type: ServerEvents.roleDeleted,
        server_id: server_role.server_id,
        data: {
          ...server_role.toObject(),
        },
      });

      return {
        id: server_role._id,
        server_id: server_role.server_id,
        name: server_role.name,
        color: server_role.color,
        allow_anyone_mention: server_role.allow_anyone_mention,
        position: server_role.position,
        permissions: server_role.permissions,
        is_admin: server_role.is_admin,
        default: server_role.default,
        last_modified: server_role.last_modified,
        number_of_users: deletedUsers
      }
    },
  },
};

export default { API: serverRoleAPI };
