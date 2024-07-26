import { IResolvers } from "@graphql-tools/utils";
import { AuthenticationError, UserInputError } from "apollo-server";

import ServerModel from "../../models/server";
import UserModel from "../../models/user";
import { getAsyncIterator, publishEvent, PubSubEvents } from "../pubsub/pubsub";

const createServerTransaction = async (input) => {
  // Create session
  const session = await ServerModel.startSession();
  session.startTransaction();

  try {
    // Create server
    const server = await ServerModel.create([input], { session });

    // TODO: Add server member logic here
    // TODO: Add server emoji logic here

    // Commit transaction
    await session.commitTransaction();
    return server;
  } catch (error) {
    // Rollback transaction
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const deleteServerTransaction = async (server_id) => {
  // Create session
  const session = await ServerModel.startSession();
  session.startTransaction();

  try {
    // Delete server
    await ServerModel.findByIdAndDelete(server_id, { session });

    // TODO: Remove all members from the server
    // TODO: Remove all emojis from the server

    // Commit transaction
    await session.commitTransaction();
    return true;
  } catch (error) {
    // Rollback transaction
    await session.abortTransaction();
    return false;
  } finally {
    session.endSession();
  }
};

const serverAPI: IResolvers = {
  Query: {
    server: async (_, { server_id }) => {
      const server = await ServerModel.findById(server_id);
      return server;
    },
    servers: async (_, { user_id }) => {
      // TODO: Implement server fetching logic after we have "Server Member" model.
      return [];
    },
  },
  Mutation: {
    createServer: async (_, { input }) => {
      const server = await createServerTransaction(input);
      return server;
    },
    updateServer: async (_, { server_id, input }) => {
      const server = await ServerModel.findByIdAndUpdate(server_id, input, {
        new: true,
      });

      publishEvent(PubSubEvents.serverUpdated, server_id, {
        type: PubSubEvents.serverUpdated,
        server,
      });
      return server;
    },
    deleteServer: async (_, { server_id }) => {
      const isDeleted = await deleteServerTransaction(server_id);

      if (!isDeleted) {
        publishEvent(PubSubEvents.serverDeleted, server_id, {
          type: PubSubEvents.serverDeleted,
          server_id,
        });
      }

      return isDeleted;
    },
    createInviteCode: async (_, { server_id, input }) => {
      const server = await ServerModel.findById(server_id);

      if (!server) {
        throw new UserInputError("Server not found !");
      }

      const inviteCode = {
        url: input.url,
        expiredAt: input.expiredAt,
        maxUses: input.maxUses,
        currentUses: 0,
      };

      await ServerModel.updateOne(
        { _id: server_id },
        {
          $push: { inviteCode },
        }
      );

      return inviteCode;
    },
    deleteInviteCode: async (_, { server_id, url }) => {
      const server = await ServerModel.findById(server_id);

      if (!server) {
        throw new UserInputError("Server not found !");
      }

      await ServerModel.updateOne(
        { _id: server_id },
        {
          $pull: { inviteCode: { url } },
        }
      );

      return true;
    },
  },
};

const serverWs: IResolvers = {
  Subscription: {
    serverUpdated: async (_, { server_id }) => {
      return getAsyncIterator(PubSubEvents.serverUpdated, server_id);
    },
  },
};

export { serverAPI, serverWs };
