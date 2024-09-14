import { IResolvers } from "@graphql-tools/utils";
import { AuthenticationError, UserInputError } from "apollo-server";
import { GraphQLJSON } from "graphql-scalars";
import mongoose from "mongoose";

import UserModel from "@/models/user";
import UserProfileModel from "@/models/user_profile";
import ServerModel from "@/models/servers/server";
import ServerBansModel from "@/models/servers/server_bans";
import ServerMemberModel from "@/models/servers/server_member";
import AssignedUserRoleModel from "@/models/servers/assigned_user_role";
import {
  publishEvent,
  ServerEvents,
  UserEvents,
} from "@/graphql/pubsub/pubsub";

// This will check these conditions:
// - Is a user_id exists?
// - User is not server owner
const checkPrequisites = async (server_id, user_id) => {
  const user = await UserModel.findById(user_id);
  if (!user) {
    return "User not found!";
  }

  const server = await ServerModel.findById(server_id);
  if (!server) {
    return "Server not found!";
  }

  if (String(server.owner) === String(user_id)) {
    return "Cannot kick/ban server owner!";
  }

  const serverMember = await ServerMemberModel.findOne({
    "_id.server_id": server_id,
    "_id.user_id": user_id,
  });

  if (!serverMember) {
    return "User is not a member of the server!";
  }

  return null;
};

const CreateBanTransaction = async ({ server_id, user_id }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create server ban
    const opts = { session, new: true };
    const check = await checkPrequisites(server_id, user_id);
    if (check) {
      throw new UserInputError(String(check));
    }

    const [createdBan] = await ServerBansModel.create(
      [{ _id: { server_id: server_id, user_id: user_id } }],
      opts
    );

    // Remove user from server members
    const _ = await ServerMemberModel.findOneAndDelete(
      { "_id.server_id": server_id, "_id.user_id": user_id },
      opts
    );

    publishEvent(ServerEvents.serverUpdated, {
      type: ServerEvents.memberRemoved,
      server_id,
      data: [user_id],
    });

    // Remove all roles assigned to the user
    await AssignedUserRoleModel.deleteMany({ "_id.user_id": user_id }, opts);

    // Decrease server total members (if exists in server members)
    if (_) {
      const server = await ServerModel.findById(server_id).session(session);
      server.totalMembers--;
      await server.save();
    }

    await session.commitTransaction();
    return createdBan;
  } catch (error) {
    await session.abortTransaction();
    throw new UserInputError(`Failed to ban user: ${error.message}`);
  } finally {
    session.endSession();
  }
};

const serverKickUser = async ({ server_id, user_id }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Remove user from server members
    const opts = { session, new: true };
    const check = await checkPrequisites(server_id, user_id);
    if (check) {
      throw new UserInputError(String(check));
    }

    const _ = await ServerMemberModel.findOneAndDelete(
      { "_id.server_id": server_id, "_id.user_id": user_id },
      opts
    );
    publishEvent(ServerEvents.serverUpdated, {
      type: ServerEvents.memberRemoved,
      server_id,
      data: [user_id],
    });

    // Remove all roles assigned to the user
    await AssignedUserRoleModel.deleteMany({ "_id.user_id": user_id }, opts);

    // Decrease server total members (if exists in server members)
    if (_) {
      const server = await ServerModel.findById(server_id).session(session);
      server.totalMembers--;
      await server.save();
    }

    await session.commitTransaction();
    return true;
  } catch (error) {
    await session.abortTransaction();
    throw new UserInputError(`Failed to kick user: ${error.message}`);
  }
};

const resolvers: IResolvers = {
  Query: {
    getServerBan: async (_, { server_id, user_id }) => {
      try {
        const serverBan = await ServerBansModel.findOne({
          "_id.server_id": server_id,
          "_id.user_id": user_id,
        });

        if (!serverBan) {
          return null;
        }

        return {
          server_id: serverBan._id.server_id,
          user_id: serverBan._id.user_id,
        };
      } catch (error) {
        throw error;
      }
    },
    getServerBans: async (_, { server_id, limit }) => {
      if (!limit) {
        limit = 1000;
      }

      try {
        const serverBans = await ServerBansModel.find({
          "_id.server_id": server_id,
        }).limit(limit);

        // Get user profiles of the banned users
        const user_ids = serverBans.map((ban) => ban._id.user_id);
        const profiles = UserProfileModel.find({ user_id: { $in: user_ids } });

        return profiles;
      } catch (error) {
        throw error;
      }
    },
  },
  Mutation: {
    createServerBan: async (_, { server_id, user_id }) => {
      try {
        const serverBan = await CreateBanTransaction({ server_id, user_id });

        // Publish an event to the user
        publishEvent(UserEvents.serverRemoved, {
          type: UserEvents.serverRemoved,
          user_id: String(user_id),
          data: { server_id },
        });

        return {
          server_id: serverBan._id.server_id,
          user_id: serverBan._id.user_id,
        };
      } catch (error) {
        throw error;
      }
    },
    createServerBulkBan: async (_, { server_id, user_ids }) => {
      try {
        let success = [];
        let failed = [];

        for (const user_id of user_ids) {
          try {
            const serverBan = await CreateBanTransaction({
              server_id,
              user_id,
            });
            success.push({
              server_id: serverBan._id.server_id,
              user_id: serverBan._id.user_id,
            });
          } catch (error) {
            failed.push({ user_id: user_id, error: error.message });
          }
        }

        // Publish an event to the user
        // Publish an event to the user
        publishEvent(UserEvents.serverRemoved, {
          type: UserEvents.serverRemoved,
          user_id: success.map((s) => String(s.user_id)),
          data: { server_id },
        });

        return success;
      } catch (error) {
        throw error;
      }
    },
    deleteServerBan: async (_, { server_id, user_id }) => {
      try {
        const serverBan = await ServerBansModel.findOne({
          "_id.server_id": server_id,
          "_id.user_id": user_id,
        });

        if (!serverBan) {
          return false;
        }

        await ServerBansModel.findOneAndDelete({
          "_id.server_id": server_id,
          "_id.user_id": user_id,
        });

        return true;
      } catch (error) {
        throw error;
      }
    },

    createServerKick: async (_, { server_id, user_id }) => {
      try {
        const success = await serverKickUser({ server_id, user_id });

        // Publish an event to the user
        publishEvent(UserEvents.serverRemoved, {
          type: UserEvents.serverRemoved,
          user_id: String(user_id),
          data: { server_id },
        });

        return success;
      } catch (error) {
        throw error;
      }
    },
  },
};

export default resolvers;
