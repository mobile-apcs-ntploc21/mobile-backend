import AssignedUserRoleModel from "../../../models/servers/assigned_user_role";
import { IResolvers } from "@graphql-tools/utils";
import { UserInputError } from "apollo-server-core";
import { ObjectId } from "mongoose";
import { publishEvent, ServerEvents } from "../../pubsub/pubsub";
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
    if (
      await AssignedUserRoleModel.exists({
        "_id.server_role_id": role_id,
        "_id.user_id": user_id,
      })
    ) {
      throw new UserInputError("User already has the role");
    }

    const assignedUserRole = new AssignedUserRoleModel(
      {
        _id: {
          server_role_id: role_id,
          user_id: user_id,
        },
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
    "_id.server_role_id": role_id,
  });

  // console.log(serverRoleUsers);

  // Use Promise.all to fetch all users
  return await Promise.all(
    serverRoleUsers.map(async ({ _id }) => {
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
    })
  );
};

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

    // if the role is the default role, do not allow the user to be removed
    const serverRole = await ServerRoleModel.findById(role_id);
    if (serverRole.default) {
      throw new UserInputError("Cannot remove user from default role");
    }

    const assignedUserRole = await AssignedUserRoleModel.findOneAndDelete(
      {
        "_id.server_role_id": role_id,
        "_id.user_id": user_id,
      },
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
        const server_roles = await ServerRoleModel.find({ server_id }).lean();

        // Get the list of role IDs from the server roles
        const serverRoleIds = server_roles.map((role) => String(role._id));

        // Fetch the roles assigned to the user in a single query
        const roles = await AssignedUserRoleModel.find({
          "_id.user_id": user_id,
          "_id.server_role_id": { $in: serverRoleIds },
        }).lean();

        // Fetch all the users assigned to these roles in a single query
        const userCounts = await AssignedUserRoleModel.aggregate([
          {
            $match: { "_id.server_role_id": { $in: serverRoleIds } },
          },
          {
            $group: {
              _id: "$_id.server_role_id",
              count: { $sum: 1 },
            },
          },
        ]);

        // Create a lookup map to easily fetch the user counts for each role
        const userCountMap = userCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {});

        // Build the result by merging role data with user count
        const result = roles.map((role) => {
          const role_id = String(role._id.server_role_id);
          const serverRole = server_roles.find(
            (r) => String(r._id) === role_id
          );

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
            number_of_users: userCountMap[role_id] || 0, // Use the precomputed user count
          };
        });

        return result;
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
            "_id.server_role_id": role_id,
            "_id.user_id": user_id,
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
        await addUserToRoleTransaction({ role_id, user_id });

        const serverRole = await ServerRoleModel.findById(role_id);

        const updatedRoleMembers = await getServerRoleMembers(role_id);

        await publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.userRoleAdded,
          server_id: serverRole.server_id,
          data: { role_id, user_id },
        });

        return updatedRoleMembers;
      } catch (error) {
        throw new UserInputError(error.message);
      }
    },
    removeUserFromRole: async (_, { role_id, user_id }) => {
      try {
        await removeUserFromRoleTransaction({ role_id, user_id });
        const serverRole = await ServerRoleModel.findById(role_id);
        const updatedRoleMembers = await getServerRoleMembers(role_id);

        await publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.userRoleDeleted,
          server_id: serverRole.server_id,
          data: { role_id, user_id },
        });
        return updatedRoleMembers;
      } catch (error) {
        throw new UserInputError(error.message);
      }
    },
  },
};

export default { API: assignedUserRoleAPI };
