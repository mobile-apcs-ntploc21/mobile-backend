import { IResolvers } from '@graphql-tools/utils';
import { PubSub, withFilter } from 'graphql-subscriptions';
import { AuthenticationError, UserInputError } from 'apollo-server';
import { GraphQLJSON } from 'graphql-scalars';

import ServerModel from '../../models/server';
import ServerEmoji from '../../models/serverEmoji';
import UserModel from '../../models/user';
import { getAsyncIterator, publishEvent, ServerEvents } from '../pubsub/pubsub';
import ServerMemberModel from '../../models/server_member';

const createServerTransaction = async (input) => {
  // Create session
  const session = await ServerModel.startSession();
  session.startTransaction();

  const serverInput = {
    owner: input.owner_id,
    name: input.name,
    avatar_url: input.avatar_url,
    banner_url: input.banner_url,
    totalMembers: 1,
  };

  try {
    // Create server
    const [server] = await ServerModel.create([serverInput], {
      session,
      new: true,
    });

    await ServerMemberModel.create(
      [
        {
          _id: {
            server_id: server.id,
            user_id: input.owner_id,
          },
        },
      ],
      { session }
    );

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
    // Delete server memebers
    await ServerMemberModel.deleteMany({ server_id }, { session });

    // TODO: Remove all emojis from the server
    await ServerEmoji.deleteMany({ server_id }, { session });

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
        throw new UserInputError('Server not found !');
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
        throw new UserInputError('Server not found !');
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
          throw new UserInputError('User not found !');
        }

        const server = await createServerTransaction(input);

        return server;
      } catch (error) {
        throw new UserInputError(error.message);
      }
    },
    updateServer: async (_, { server_id, input }, context) => {
      const __ = await ServerModel.findById(server_id);
      if (!__) {
        throw new UserInputError('Server not found !');
      }

      const server = await ServerModel.findByIdAndUpdate(server_id, input, {
        new: true,
      });

      await publishEvent(ServerEvents.serverUpdated, {
        type: ServerEvents.serverUpdated,
        server_id: server_id,
        data: {
          ...server.toObject(),
        },
      });
      return server;
    },
    deleteServer: async (_, { server_id }, context) => {
      const isDeleted = await deleteServerTransaction(server_id);
      if (isDeleted) {
        await publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.serverDeleted,
          server_id: server_id,
        });
      }

      return isDeleted;
    },
    transferOwnership: async (_, { server_id, user_id }, context) => {
      const user = await UserModel.findById(user_id);
      if (!user) {
        throw new UserInputError('User not found !');
      }

      const server = await ServerModel.findById(server_id);
      const owner = String(server?.owner) || null;
      if (!server) {
        throw new UserInputError('Server not found !');
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
        throw new UserInputError('Server not found !');
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
          'Cannot add this invite code this time. The invite code may already exist or invalid.'
        );
      });

      return inviteCode;
    },
    deleteInviteCode: async (_, { server_id, url }) => {
      const server = await ServerModel.findById(server_id);

      if (!server) {
        throw new UserInputError('Server not found !');
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
          return getAsyncIterator([ServerEvents.serverUpdated]);
        },
        (payload, variables, context) => {
          const server_id = String(payload.server_id) || null;
          const variables_id = variables.server_id || null;

          return server_id === variables_id;
        }
      ),
    },
  },
};

export default { API: serverAPI, Ws: serverWs };
