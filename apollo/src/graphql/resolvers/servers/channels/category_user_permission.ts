import {IResolvers} from "@graphql-tools/utils";
import {UserInputError} from "apollo-server";
import {
  GeneralCategoryPermissions,
  MembershipPermissions,
  PermissionStates,
  TextChannelPermissions,
  VoiceChannelPermissions
} from "../../../../constants/permissions";
import mongoose, {ObjectId} from "mongoose";
import {publishEvent, ServerEvents} from "../../../pubsub/pubsub";
import UserModel from "../../../../models/user";
import Category from "../../../../models/servers/channels/category";
import CategoryUserPermission from "../../../../models/servers/channels/category_user_permission";

export const defaultCategoryUserPermission = JSON.stringify({
  // General Category Permissions
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

const createCategoryUserPermission = async (user_id: ObjectId, category_id: ObjectId,  permissions: String ) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  if (!permissions) {
    permissions = defaultCategoryUserPermission;
  }
  try {
    if (!UserModel.findById(user_id).session(session)) {
      throw new UserInputError("User not found");
    }

    if (!Category.findById(category_id).session(session)) {
      throw new UserInputError("Category not found");
    }

    const category_user_permission = await CategoryUserPermission.create({
      user_id,
      category_id,
      permissions,
    });

    await session.commitTransaction();
    await session.endSession();

    return category_user_permission;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();

    throw error;
  }
};

const categoryUserPermissionAPI: IResolvers = {
  Query: {
    syncCategoryUserPermission: async (_, __, { user }) => {
      try {
        // empty
        return await CategoryUserPermission.find();
      } catch (err) {
        throw new UserInputError("Cannot sync category permissions for users!");
      }
    },
    getCategoryUserPermission: async (_, { user_id, category_id }) => {
      try {
        return await CategoryUserPermission.findOne({ user_id, category_id });
      } catch (err) {
        throw new UserInputError("Cannot get category permissions associated with this user!");
      }
    },
  },
  Mutation: {
    createCategoryUserPermission: async (_, { user_id, category_id, permissions }) => {
      const category_user_permission = await createCategoryUserPermission(user_id, category_id, permissions);

      const category = await Category.findById(category_id);

      publishEvent(ServerEvents.serverUpdated, {
        type: ServerEvents.categoryUserAdded,
        server_id: category.server_id,
        data: {
          ...category_user_permission.toObject(),
        },
      });

      return category_user_permission;
    },
    updateCategoryUserPermission: async (_, { user_id, category_id, permissions }) => {
      const category_user_permission = await CategoryUserPermission.findOneAndUpdate(
        { user_id, category_id },
        { permissions },
        { new: true }
      );

      const category = await Category.findById(category_id);

      publishEvent(ServerEvents.serverUpdated, {
        type: ServerEvents.categoryUserUpdated,
        server_id: category.server_id,
        data: {
          ...category_user_permission.toObject(),
        },
      });

      return category_user_permission;
    },
    deleteCategoryUserPermission: async (_, { user_id, category_id }) => {
      const category_user_permission = await CategoryUserPermission.findOneAndDelete({ user_id, category_id });

      const category = await Category.findById(category_id);

      publishEvent(ServerEvents.serverUpdated, {
        type: ServerEvents.categoryUserDeleted,
        server_id: category.server_id,
        data: {
          ...category_user_permission.toObject(),
        },
      });

      return category_user_permission;
    },
  },
};

export default { API: categoryUserPermissionAPI };
