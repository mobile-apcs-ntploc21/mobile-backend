import AssignedUserRoleModel from '../../../models/servers/assigned_user_role';
import {IResolvers} from '@graphql-tools/utils';
import {UserInputError} from 'apollo-server-core';
import {ObjectId} from 'mongoose';
import {publishEvent, ServerEvents} from '../../pubsub/pubsub';
import ServerModel from "../../../models/servers/server";
import UserModel from "../../../models/user";
import ServerRoleModel from "../../../models/servers/server_role";
import ServerMemberModel from "../../../models/servers/server_member";
import UserProfileModel from "../../../models/user_profile";

type AssignedUserRole = {
  role_id: ObjectId;
  user_id: ObjectId;
};

const addUserToRoleTransaction = async ({
                                            role_id,
                                            user_id,
                                          }: AssignedUserRole) => {
  const session = await AssignedUserRoleModel.startSession();
  session.startTransaction();

  try {
    if (!UserModel.findById(user_id).session(session)) {
      throw new UserInputError("Server not found");
    }

    const serverRole = await ServerRoleModel.findById(role_id).session(session);
    if (!serverRole) {
      throw new UserInputError("Server role not found");
    }
    const server_id = serverRole.server_id;

    if (!ServerModel.findById(server_id).session(session)) {
      throw new UserInputError("Server not found");
    }

    // check if user is a member of the server
    if (!ServerMemberModel.exists({ server_id, user_id })) {
      throw new UserInputError("User is not a member of the server");
    }

    // check if the user has already been assigned the role
    if (await AssignedUserRoleModel.exists({
      '_id.server_role_id': role_id,
      '_id.user_id': user_id,
    })) {
      throw new UserInputError("User already has the role");
    }

    const assignedUserRole = new AssignedUserRoleModel({
        _id: {
          server_role_id: role_id,
          user_id: user_id,
        }
    },
      { session }
    );

    await assignedUserRole.save();

    await session.commitTransaction();
    await session.endSession();
    return assignedUserRole;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

const getServerRoleMembers = async (role_id: ObjectId) => {
  const serverRole = await ServerRoleModel.findById(role_id);
  if (!serverRole) {
    throw new UserInputError("Server role not found");
  }

  const server_id = serverRole.server_id;

  const serverRoleUsers = await AssignedUserRoleModel.find({
    '_id.server_role_id': role_id
  });

  // console.log(serverRoleUsers);

  // Use Promise.all to fetch all users
  return await Promise.all(serverRoleUsers.map(async ({_id}) => {
    const user_id = _id.user_id;
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
    };
  }));
}

const removeUserFromRoleTransaction = async ({
                                               role_id,
                                               user_id,
                                             }: AssignedUserRole) => {
  const session = await AssignedUserRoleModel.startSession();
  session.startTransaction();

  try {
    if (!UserModel.findById(user_id).session(session)) {
      throw new UserInputError("User not found");
    }

    if (!ServerRoleModel.findById(role_id).session(session)) {
      throw new UserInputError("Server role not found");
    }

    const assignedUserRole = await AssignedUserRoleModel.findOneAndDelete(
      { role_id, user_id },
      { session }
    );

    if (!assignedUserRole) {
      throw new UserInputError("User is not assigned the role");
    }

    await session.commitTransaction();
    await session.endSession();
    return assignedUserRole;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

// =============================

const assignedUserRoleAPI: IResolvers = {
  Query: {
    getRolesAssignedWithUser: async (_, { user_id, server_id }) => {
      try {
        const server_roles = await ServerRoleModel.find({
          server_id,
        });

        const roles = await AssignedUserRoleModel.find({
          '_id.user_id': user_id,
          '_id.server_role_id': {$in: server_roles.map((role) => role._id)},
        });

        return await Promise.all(roles.map(async (role) => {
          const role_id = role._id.server_role_id;
          const serverRole = await ServerRoleModel.findById(role_id);
          return {
            id: serverRole._id,
            server_id: serverRole.server_id,
            name: serverRole.name,
            color: serverRole.color,
            allow_anyone_mention: serverRole.allow_anyone_mention,
            position: serverRole.position,
            permissions: serverRole.permissions,
            is_admin: serverRole.is_admin,
            last_modified: serverRole.last_modified,
            number_of_users: roles.length,
          };
        }));
      } catch (error) {
        throw new UserInputError(error.message);
      }
    },
    getUsersAssignedWithRole: async (_, { role_id }) => {
      try {
        return await getServerRoleMembers(role_id);
      } catch (error) {
        throw new UserInputError(error.message);
      }
    },
    checkUserHasRole: async (_, { role_id, user_id }) => {
      try {
        return (
          (await AssignedUserRoleModel.exists({
            '_id.server_role_id': role_id,
            '_id.user_id': user_id,
          })) !== null
        );
      } catch (error) {
        throw new UserInputError(error.message);
      }
    },
  },
  Mutation: {
    addUserToRole: async (_, { role_id, user_id }) => {
      try {
        const res = await addUserToRoleTransaction({ role_id, user_id });

        const serverRole = await ServerRoleModel.findById(role_id);

        const updatedRoleMembers = await getServerRoleMembers(role_id);

        await publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.userRoleAdded,
          server_id: serverRole.server_id,
          data: updatedRoleMembers,
        });

        return updatedRoleMembers;
      } catch (error) {
        throw new UserInputError(error.message);
      }
    },
    removeUserFromRole: async (_, { role_id, user_id }) => {
      try {
        const res = await removeUserFromRoleTransaction({role_id, user_id});
        const serverRole = await ServerRoleModel.findById(role_id);
        const updatedRoleMembers = await getServerRoleMembers(role_id);

        await publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.userRoleDeleted,
          server_id: serverRole.server_id,
          data: updatedRoleMembers,
        });
        return updatedRoleMembers;
      } catch (error) {
        throw new UserInputError(error.message);
      }
    },
  },
};

export default { API: assignedUserRoleAPI };