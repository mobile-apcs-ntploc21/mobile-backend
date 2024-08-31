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
import AssignedUserRoleModel from "../../../../models/servers/assigned_user_role";

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

    // check if server role is already assigned with the category
    if (await CategoryRolePermission.exists({
      '_id.server_role_id': role_id,
      '_id.category_id': category_id
    })) {
      throw new UserInputError("Server role is already assigned to category permissions!");
    }

    const category_role = await CategoryRolePermission.create({
      _id: {
        server_role_id: role_id,
        category_id,
      },
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
        // iterate through all servers and their categories, if the default server role of that server
        // is not assigned with the existing category, assign it with the default permissions

        const categories = await Category.find({});

        await Promise.all(categories.map(async (category) => {
          const category_id = category._id;
          const server_id = category.server_id;
          let defaultServerRole = await ServerRoleModel.findOne({
            server_id,
            default: true,
          });

          if (!defaultServerRole) {
            // create default server role if not found
            await ServerRoleModel.create({
              server_id: server_id,
              name: '@everyone',
              color: '#000000',
              allow_anyone_mention: true,
              position: 0,
              permissions: defaultServerRole,
              is_admin: false,
              default: true
            });
            defaultServerRole = await ServerRoleModel.findOne({ server_id: server_id, default: true });
          }

          const categoryRole = await CategoryRolePermission.findOne({
            '_id.server_role_id': defaultServerRole._id,
            '_id.category_id': category_id
          });

          if (!categoryRole) {
            const category_role = await CategoryRolePermission.create({
              _id: {
                server_role_id: defaultServerRole._id,
                category_id,
              },
              permissions: defaultCategoryRole,
            });
          }

        }));

        return await CategoryRolePermission.find({});
      } catch (err) {
        throw new UserInputError("Cannot sync category permissions for roles!");
      }
    },
    getCategoryRolesPermissions: async (_, { category_id }) => {
      try {
        const categoryRoles = await CategoryRolePermission.find({
          '_id.category_id': category_id,
        });

        return await Promise.all(categoryRoles.map(async (role) => {
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
        throw new UserInputError("Cannot get category permissions for roles!");
      }
    },
    getCategoryRolePermission: async (_, { role_id, category_id }) => {
      try {
        // check if role_id is valid
        const serverRole = await ServerRoleModel.findById(role_id);
        if (!serverRole) {
          throw new UserInputError("Server role not found!");
        }

        const category_role = await CategoryRolePermission.findOne({
          '_id.server_role_id': role_id,
          '_id.category_id': category_id,
        });
        const users = await AssignedUserRoleModel.find({'_id.server_role_id': role_id});

        return {
          id: serverRole._id,
          server_id: serverRole.server_id,
          name: serverRole.name,
          color: serverRole.color,
          allow_anyone_mention: serverRole.allow_anyone_mention,
          position: serverRole.position,
          permissions: category_role.permissions,
          is_admin: serverRole.is_admin,
          last_modified: serverRole.last_modified,
          number_of_users: users.length,
        };
      } catch (err) {
        throw new UserInputError("Cannot get category permissions associated with this role!");
      }
    },
  },
  Mutation: {
    createCategoryRolePermission: async (_, { role_id, category_id, permissions }) => {
      try {
        const category_role = await createCategoryRole(role_id, category_id, permissions);

        const server_role = await ServerRoleModel.findById(role_id);

        publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.categoryRoleAdded,
          server_id: server_role.server_id,
          data: {
            ...category_role.toObject(),
          },
        });

        const roles = await CategoryRolePermission.find({
          '_id.category_id': category_id
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
    updateCategoryRolePermission: async (_, { role_id, category_id, permissions }) => {
      try {
        const category_role = await CategoryRolePermission.findOneAndUpdate(
          {
            '_id.server_role_id': role_id,
            '_id.category_id': category_id
          },
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

        const users = await AssignedUserRoleModel.find({'_id.server_role_id': role_id});

        return {
          id: server_role._id,
          server_id: server_role.server_id,
          name: server_role.name,
          color: server_role.color,
          allow_anyone_mention: server_role.allow_anyone_mention,
          position: server_role.position,
          permissions: category_role.permissions,
          is_admin: server_role.is_admin,
          default: server_role.default,
          last_modified: server_role.last_modified,
          number_of_users: users.length,
        };
      } catch (error) {
        throw new UserInputError("Cannot update category permissions for role!");
      }
    },
    deleteCategoryRolePermission: async (_, { role_id, category_id }) => {
      try {
        // check if the current role is a default role, if yes, throw an error
        const serverRole = await ServerRoleModel.findById(role_id);
        if (serverRole.default) {
          throw new UserInputError("Cannot delete default server role!");
        }

        const category_role = await CategoryRolePermission.findOneAndDelete({
          '_id.server_role_id': role_id,
          '_id.category_id': category_id
        });

        const server_role = await ServerRoleModel.findById(role_id);

        publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.categoryRoleDeleted,
          server_id: server_role.server_id,
          data: {
            ...category_role.toObject(),
          },
        });

        const roles = await CategoryRolePermission.find({
          '_id.category_id': category_id
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
        throw new UserInputError("Cannot delete category permissions for role!");
      }
    },
  },
};

export default { API: categoryRoleAPI };
