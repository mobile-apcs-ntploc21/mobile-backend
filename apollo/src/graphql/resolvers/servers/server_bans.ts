import { IResolvers } from "@graphql-tools/utils";
import { AuthenticationError, UserInputError } from "apollo-server";
import { GraphQLJSON } from "graphql-scalars";
import mongoose from "mongoose";

import ServerModel from "@/models/servers/server";
import ServerBansModel from "@/models/servers/server_bans";
import ServerMemberModel from "@/models/servers/server_member";

const CreateBanTransaction = async ({ server_id, user_id }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create server ban
    const opts = { session, new: true };
    const server = await ServerModel.findById(server_id).session(session);

    if (String(server.owner) === String(user_id)) {
      throw new UserInputError("Cannot ban server owner!");
    }

    const serverBan = await ServerBansModel.findOne({
      "_id.server": server_id,
      "_id.user": user_id,
    });

    if (serverBan) {
      throw new UserInputError("User is already banned!");
    }

    const [createdBan] = await ServerBansModel.create(
      [{ _id: { server: server_id, user: user_id } }],
      opts
    );

    // Remove user from server members
    const _ = await ServerMemberModel.findOneAndDelete(
      { "_id.server": server_id, "_id.user": user_id },
      opts
    );

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
    console.error(error);
    throw new UserInputError(`Failed to ban user: ${error.message}`);
  } finally {
    session.endSession();
  }
};

const resolvers: IResolvers = {
  Query: {
    getServerBan: async (_, { server_id, user_id }) => {
      try {
        const serverBan = await ServerBansModel.findOne({
          "_id.server": server_id,
          "_id.user": user_id,
        });

        if (!serverBan) {
          return null;
        }

        return {
          server: serverBan._id.server,
          user: serverBan._id.user,
        };
      } catch (error) {
        throw error;
      }
    },
    getServerBans: async (_, { server_id, limit }) => {
      try {
        const serverBans = await ServerBansModel.find({
          "_id.server": server_id,
        })
          .limit(limit)
          .sort({ createdAt: -1 });

        return serverBans.map((ban) => ({
          server: ban._id.server,
          user: ban._id.user,
        }));
      } catch (error) {
        throw error;
      }
    },
  },
  Mutation: {
    createServerBan: async (_, { server_id, user_id }) => {
      try {
        const serverBan = await CreateBanTransaction({ server_id, user_id });

        return {
          server: serverBan._id.server,
          user: serverBan._id.user,
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
              server: serverBan._id.server,
              user: serverBan._id.user,
            });
          } catch (error) {
            failed.push({ user: user_id, error: error.message });
          }
        }

        return success;
      } catch (error) {
        throw error;
      }
    },
    deleteServerBan: async (_, { server_id, user_id }) => {
      try {
        const serverBan = await ServerBansModel.findOne({
          "_id.server": server_id,
          "_id.user": user_id,
        });

        if (!serverBan) {
          return false;
        }

        await ServerBansModel.findOneAndDelete({
          _id: { server: server_id, user: user_id },
        });

        return true;
      } catch (error) {
        throw error;
      }
    },

    createServerKick: async (_, { server_id, user_id }) => {
      try {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          // Remove user from server members
          const opts = { session, new: true };
          const server = await ServerModel.findById(server_id).session(session);

          if (String(server.owner) === String(user_id)) {
            throw new UserInputError("Cannot kick server owner!");
          }

          const _ = await ServerMemberModel.findOneAndDelete(
            { "_id.server": server_id, "_id.user": user_id },
            opts
          );

          // Decrease server total members (if exists in server members)
          if (_) {
            server.totalMembers--;
            await server.save();
          }

          await session.commitTransaction();
          return true;
        } catch (error) {
          await session.abortTransaction();
          console.error(error);
          throw new UserInputError(`Failed to kick user: ${error.message}`);
        }
      } catch (error) {
        throw error;
      }
    },
  },
};

export default resolvers;
