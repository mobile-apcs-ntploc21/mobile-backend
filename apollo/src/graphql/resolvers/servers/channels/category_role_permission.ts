import {IResolvers} from "@graphql-tools/utils";
import {UserInputError} from "apollo-server";
import CategoryRolePermission from "../../../../models/servers/channels/category_role_permission"
import {
  GeneralCategoryPermissions,
  MembershipPermissions,
  PermissionStates,
  TextChannelPermissions,
  VoiceChannelPermissions
} from "../../../../constants/permissions";
import mongoose, {ObjectId} from "mongoose";
import {publishEvent, ServerEvents} from "../../../pubsub/pubsub";
import ServerRoleModel from "../../../../models/servers/server_role";
import Category from "../../../../models/servers/channels/category";

export const defaultCategoryRole = JSON.stringify({
  // General Channel Permissions
  [GeneralCategoryPermissions.VIEW_CHANNEL]: PermissionStates.DEFAULT,
  [GeneralCategoryPermissions.MANAGE_CHANNEL]: PermissionStates.DEFAULT,

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

const createCategoryRole = async (role_id: ObjectId, category_id: ObjectId,  permissions: String ) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  if (!permissions) {
    permissions = defaultCategoryRole;
  }
  try {
    if (!ServerRoleModel.findById(role_id).session(session)) {
      throw new UserInputError("Server role not found");
    }

    if (!Category.findById(category_id).session(session)) {
      throw new UserInputError("Category not found");
    }

    const category_role = await CategoryRolePermission.create({
      role_id,
      category_id,
      permissions,
    });

    await session.commitTransaction();
    await session.endSession();

    return category_role;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();

    throw error;
  }
};

const categoryRoleAPI: IResolvers = {
  Query: {
    syncCategoryRolePermission: async (_, __, { user }) => {
      try {
        // empty
        return await CategoryRolePermission.find();
      } catch (err) {
        throw new UserInputError("Cannot sync category permissions for roles!");
      }
    },
    getCategoryRolePermission: async (_, { role_id, category_id }) => {
      try {
        return await CategoryRolePermission.findOne({ role_id, category_id });
      } catch (err) {
        throw new UserInputError("Cannot get category permissions associated with this role!");
      }
    },
  },
  Mutation: {
    createCategoryRolePermission: async (_, { role_id, category_id, permissions }) => {
      const category_role = await createCategoryRole(role_id, category_id, permissions);

      const server_role = await ServerRoleModel.findById(role_id);

      publishEvent(ServerEvents.serverUpdated, {
        type: ServerEvents.categoryRoleAdded,
        server_id: server_role.server_id,
        data: {
          ...category_role.toObject(),
        },
      });

      return category_role;
    },
    updateCategoryRolePermission: async (_, { role_id, category_id, permissions }) => {
      const category_role = await CategoryRolePermission.findOneAndUpdate(
        { role_id, category_id },
        { permissions },
        { new: true }
      );

      const server_role = await ServerRoleModel.findById(role_id);

      publishEvent(ServerEvents.serverUpdated, {
        type: ServerEvents.categoryRoleUpdated,
        server_id: server_role.server_id,
        data: {
          ...category_role.toObject(),
        },
      });

      return category_role;
    },
    deleteCategoryRolePermission: async (_, { role_id, channel_id }) => {
      const category_role = await CategoryRolePermission.findOneAndDelete({ role_id, channel_id });

      const server_role = await ServerRoleModel.findById(role_id);

      publishEvent(ServerEvents.serverUpdated, {
        type: ServerEvents.categoryRoleDeleted,
        server_id: server_role.server_id,
        data: {
          ...category_role.toObject(),
        },
      });

      return category_role;
    },
  },
};

export default { API: categoryRoleAPI };
