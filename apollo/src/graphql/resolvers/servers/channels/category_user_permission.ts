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
import UserProfileModel from "@models/user_profile";
import CategoryRolePermission from "@models/servers/channels/category_role_permission";

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
      _id: {
        user_id,
        category_id
      },
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
    getCategoryUsersPermissions: async (_, { category_id }) => {
      try {
        const category = await Category.findById(category_id);
        if (!category) {
          throw new UserInputError("Category not found");
        }
        const server_id = category.server_id;

        const categoryUsers = await CategoryUserPermission.find({
          '_id.category_id': category_id,
        });


        // Use Promise.all to fetch all users
        return await Promise.all(categoryUsers.map(async (categoryUser) => {
          const user_id = categoryUser._id.user_id;
          let user = await UserProfileModel.findOne({
            user_id: user_id,
            server_id: server_id,
          });

          if (!user) {
            user = await UserProfileModel.findOne({
              user_id: user_id,
              server_id: null,
            });
          }

          return {
            id: user_id,
            username: user.username,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            banner_url: user.banner_url,
            about_me: user.about_me,
            permissions: categoryUser.permissions,
          };
        }));

      } catch (err) {
        throw new UserInputError("Cannot get category permissions associated with this user!");
      }
    },
    getCategoryUserPermission: async (_, { user_id, category_id }) => {
      try {
        const category = await Category.findById(category_id);
        if (!category) {
          throw new UserInputError("Category not found");
        }
        const server_id = category.server_id;

        const category_user_permission = await CategoryUserPermission.findOne({
          '_id.user_id': user_id,
          '_id.category_id': category_id
        });

        if (!category_user_permission) {
          throw new UserInputError("Category user permission not found");
        }

        let user = await UserProfileModel.findOne({
          user_id: user_id,
          server_id: server_id,
        });

        if (!user) {
          user = await UserProfileModel.findOne({
            user_id: user_id,
            server_id: null,
          });
        }

        return {
          id: user_id,
          username: user.username,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
          banner_url: user.banner_url,
          about_me: user.about_me,
          permissions: category_user_permission.permissions,
        };
      } catch (err) {
        throw new UserInputError("Cannot get category permissions associated with this user!");
      }
    },
  },
  Mutation: {
    createCategoryUserPermission: async (_, { user_id, category_id, permissions }) => {
      try {

        const category_user_permission = await createCategoryUserPermission(user_id, category_id, permissions);

        const category = await Category.findById(category_id);

        publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.categoryUserAdded,
          server_id: category.server_id,
          data: {
            ...category_user_permission.toObject(),
          },
        });

        const categoryUsers = await CategoryUserPermission.find({
          '_id.category_id': category_id
        });

        return await Promise.all(categoryUsers.map(async (categoryUser) => {
          const user_id = categoryUser._id.user_id;
          let user = await UserProfileModel.findOne({
            user_id: user_id,
            server_id: category.server_id,
          });

          if (!user) {
            user = await UserProfileModel.findOne({
              user_id: user_id,
              server_id: null,
            });
          }

          return {
            id: user_id,
            username: user.username,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            banner_url: user.banner_url,
            about_me: user.about_me,
            permissions: categoryUser.permissions
          };
        }));
      } catch (error) {
        throw new UserInputError("Cannot create category permissions for user!");
      }

    },
    updateCategoryUserPermission: async (_, { user_id, category_id, permissions }) => {
      try {
        const category = await Category.findById(category_id);
        if (!category) {
          throw new UserInputError("Category not found");
        }
        const server_id = category.server_id;

        const category_user_permission = await CategoryUserPermission.findOneAndUpdate(
          {
            '_id.user_id': user_id,
            '_id.category_id': category_id
          },
          {permissions},
          {new: true}
        );

        publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.categoryUserUpdated,
          server_id: category.server_id,
          data: {
            ...category_user_permission.toObject(),
          },
        });

        let user = await UserProfileModel.findOne({
          user_id: user_id,
          server_id: server_id,
        });

        if (!user) {
          user = await UserProfileModel.findOne({
            user_id: user_id,
            server_id: null,
          });
        }

        return {
          id: user_id,
          username: user.username,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
          banner_url: user.banner_url,
          about_me: user.about_me,
          permissions: category_user_permission.permissions,
        };
      } catch (error) {
        throw new UserInputError("Cannot update category permissions for user!");
      }
    },
    deleteCategoryUserPermission: async (_, { user_id, category_id }) => {
      try {
        const category_user_permission = await CategoryUserPermission.findOneAndDelete({
          '_id.user_id': user_id,
          '_id.category_id': category_id
        });

        const category = await Category.findById(category_id);

        publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.categoryUserDeleted,
          server_id: category.server_id,
          data: {
            ...category_user_permission.toObject(),
          },
        });

        const categoryUsers = await CategoryUserPermission.find({
          '_id.category_id': category_id
        });

        return await Promise.all(categoryUsers.map(async (categoryUser) => {
          const user_id = categoryUser._id.user_id;
          let user = await UserProfileModel.findOne({
            user_id: user_id,
            server_id: category.server_id,
          });

          if (!user) {
            user = await UserProfileModel.findOne({
              user_id: user_id,
              server_id: null,
            });
          }

          return {
            id: user_id,
            username: user.username,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            banner_url: user.banner_url,
            about_me: user.about_me,
            permissions: categoryUser.permissions
          };
        }));
      } catch (error) {
        throw new UserInputError("Cannot delete category permissions for user!");
      }
    },
  },
};

export default { API: categoryUserPermissionAPI };
