import { IResolvers } from "@graphql-tools/utils";
import { AuthenticationError, UserInputError } from "apollo-server";
import { GraphQLJSON } from "graphql-scalars";

import { ServerBan } from "../../models/server_bans";

const resolvers: IResolvers = {
  Query: {
    getServerBan: async (_, { server_id, user_id }) => {
      try {
        const serverBan = await ServerBan.findOne({
          server: server_id,
          user: user_id,
        });
        return serverBan;
      } catch (error) {
        throw error;
      }
    },
    getServerBans: async (_, { server_id, limit }) => {
      try {
        const serverBans = await ServerBan.find({ server: server_id })
          .limit(limit)
          .sort({ createdAt: -1 });
        return serverBans;
      } catch (error) {
        throw error;
      }
    },
  },
  Mutation: {
    createServerBan: async (_, { server_id, user_id }) => {
      try {
        const serverBan = await ServerBan.create({
          server: server_id,
          user: user_id,
        });
        return serverBan;
      } catch (error) {
        throw error;
      }
    },
    createServerBulkBan: async (_, { server_id, user_ids }) => {
      try {
        const serverBans = await ServerBan.insertMany(
          user_ids.map((user_id) => ({ server: server_id, user: user_id }))
        );
        return serverBans;
      } catch (error) {
        throw error;
      }
    },
    deleteServerBan: async (_, { server_id, user_id }) => {
      try {
        const serverBan = await ServerBan.findOneAndDelete({
          server: server_id,
          user: user_id,
        });
        return true;
      } catch (error) {
        throw error;
      }
    },
  },
};

export default resolvers;
