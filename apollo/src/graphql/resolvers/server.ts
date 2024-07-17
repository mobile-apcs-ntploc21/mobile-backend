import { IResolvers } from "@graphql-tools/utils";
import { UserInputError } from "apollo-server";
import { combineResolvers } from "graphql-resolvers";
import ServerModel from "../../models/server";

// mock resolver, it is not yet ready to be used
const serverResolver: IResolvers = {
  Query: {
    getServerById: async (_, { serverId }) => {
      try {
        const server = await ServerModel.findById(serverId);
        return server;
      } catch (error) {
        throw new UserInputError(error.message);
      }
    },
    getServersByUserId: async (_, { userId }) => {
      try {
        const servers = await ServerModel.find({ owner: userId });
        return servers;
      } catch (error) {
        throw new UserInputError(error.message);
      }
    },
  },
  Mutation: {
    createServer: async (_, { ownerId, name }) => {
      try {
        const server = await ServerModel.create({ owner: ownerId, name });
        return server;
      } catch (error) {
        throw new UserInputError(error.message);
      }
    },
    updateServer: async (_, { serverId, name, photo_url, background_url }) => {
      try {
        const server = await ServerModel.findByIdAndUpdate(
          serverId,
          { name, photo_url, background_url },
          { new: true }
        );
        return server;
      } catch (error) {
        throw new UserInputError(error.message);
      }
    },
    deleteServer: async (_, { serverId }) => {
      try {
        const server = await ServerModel.findByIdAndDelete(serverId);
        return server;
      } catch (error) {
        throw new UserInputError(error.message);
      }
    },
  },
};

export default serverResolver;