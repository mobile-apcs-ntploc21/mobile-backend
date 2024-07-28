import { IResolvers } from "@graphql-tools/utils";
import { PubSub, withFilter } from "graphql-subscriptions";
import { AuthenticationError, UserInputError } from "apollo-server";
import { GraphQLJSON } from "graphql-scalars";

import ServerModel from "../../models/server";
import UserModel from "../../models/user";
import { getAsyncIterator, publishEvent, PubSubEvents } from "../pubsub/pubsub";
import { error } from "console";

const createServerTransaction = async (input) => {
  // Create session
  const session = await ServerModel.startSession();
  session.startTransaction();

  const serverInput = {
    owner: input.owner_id,
    name: input.name,
    avatar_url: input.avatar_url,
    banner_url: input.banner_url,
  };

  try {
    // Create server
    const [server] = await ServerModel.create([serverInput], {
      session,
      new: true,
    });

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

      if (!server) {
        throw new UserInputError("Server not found !");
      }

      return server;
    },
    servers: async (_, { user_id }) => {
      // TODO: Implement server fetching logic after we have "Server Member" model.
      return [];
    },
    getInviteCode: async (_, { server_id }) => {
      // TODO: Implement server fetching logic after we have "Server Member" model via user roles.
      const server = await ServerModel.findById(server_id);

      if (!server) {
        throw new UserInputError("Server not found !");
      }

      return server.invite_code;
    },
  },
  Mutation: {
    createServer: async (_, { input }) => {
      // Prequisite check
      try {
        const user = await UserModel.findById(input.owner_id);
        if (!user) {
          throw new UserInputError("User not found !");
        }

        const server = await createServerTransaction(input);

        return server;
      } catch (error) {
        throw new UserInputError(error.message);
      }
    },
    updateServer: async (_, { server_id, input }, context) => {
      // TODO: Add user role logic here to check if the user has authority to update the server
      const user = await UserModel.findById(context.user_id);
      if (!user) {
        throw new AuthenticationError("User not found !");
      }

      const __ = await ServerModel.findById(server_id);
      if (!__) {
        throw new UserInputError("Server not found !");
      }

      const server = await ServerModel.findByIdAndUpdate(server_id, input, {
        new: true,
      });

      await publishEvent(PubSubEvents.serverUpdated, {
        type: PubSubEvents.serverUpdated,
        server_id: server_id,
        data: {
          ...server.toObject(),
        },
      });
      return server;
    },
    deleteServer: async (_, { server_id }, context) => {
      if (!context.user_id) {
        throw new AuthenticationError("This route is unauthorized!");
      }

      const server = await ServerModel.findById(server_id);
      if (!server) {
        throw new UserInputError("Server not found !");
      }
      if (String(server.owner) !== context.user_id) {
        // Check if the user is the owner of the server
        throw new AuthenticationError("You are not the owner of the server !");
      }

      const isDeleted = await deleteServerTransaction(server_id);
      if (isDeleted) {
        await publishEvent(PubSubEvents.serverDeleted, {
          type: PubSubEvents.serverDeleted,
          server_id: server_id,
        });
      }

      return isDeleted;
    },
    transferOwnership: async (_, { server_id, user_id }, context) => {
      if (!context.user_id) {
        throw new AuthenticationError("This route is unauthorized!");
      }

      const server = await ServerModel.findById(server_id);
      const owner = String(server?.owner) || null;
      if (!server) {
        throw new UserInputError("Server not found !");
      }

      if (owner !== context.user_id) {
        // Check if the user is the owner of the server
        throw new AuthenticationError("You are not the owner of the server !");
      }

      const user = await UserModel.findById(user_id);
      if (!user) {
        throw new UserInputError("User not found !");
      }

      if (user_id === owner) {
        throw new UserInputError("You can't transfer ownership to yourself !");
      }

      await ServerModel.findByIdAndUpdate(server_id, { owner: user_id });

      return true;
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
          $push: { invite_code: inviteCode },
        }
      ).catch((error) => {
        throw new UserInputError(
          "Cannot add this invite code this time. The invite code may already exist or invalid."
        );
      });

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
          $pull: { invite_code: { url } },
        }
      );

      return true;
    },
  },
};

// ========================

const serverWs: IResolvers = {
  JSON: GraphQLJSON,
  Subscription: {
    serverUpdated: {
      resolve: (payload) => {
        return payload;
      },
      subscribe: withFilter(
        () => {
          return getAsyncIterator(Object.values(PubSubEvents));
        },
        (payload, variables, context) => {
          return payload.server_id === variables.server_id;

          // // Initialize the data
          // const type = payload.type;
          // const server_id = String(payload.server_id) || null;
          // const variables_id = variables.server_id || null;

          // // Handle different types of events
          // switch (type) {
          //   case PubSubEvents.serverUpdated:
          //     return server_id === variables_id;
          //   case PubSubEvents.serverDeleted:
          //     return server_id === variables_id;
          //   // Add more cases here
          // }

          // return false;
        }
      ),
    },
  },
};

export default { serverAPI, serverWs };
