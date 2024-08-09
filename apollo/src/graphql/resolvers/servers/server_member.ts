import serverModel from "../../models/server";
import ServerMemberModel from "../../models/server_member";
import ServerBansModel from "../../models/server_bans";
import { IResolvers } from "@graphql-tools/utils";
import { UserInputError, ForbiddenError } from "apollo-server-core";
import { ObjectId, Schema } from "mongoose";
import { publishEvent, ServerEvents } from "../pubsub/pubsub";

import user from "../typedefs/user";

type ServerMembers = {
  server_id: ObjectId;
  user_ids: ObjectId[];
};

interface InviteCode {
  url: string;
  expiredAt?: Date;
  maxUses: number;
  currentUses: number;
}

const validateInviteCode = async (url: string) => {
  if (!url) throw new Error("Invite code URL is required");

  const response = await serverModel.findOne({
    invite_code: {
      $elemMatch: { url },
    },
  });

  if (!response) throw new Error("This server does not have any invite codes");

  const inviteCodes = response.invite_code;
  const index = inviteCodes.findIndex((code: InviteCode) => code.url === url);
  const inviteCode = inviteCodes[index];

  if (inviteCode.expiredAt && new Date(inviteCode.expiredAt) < new Date())
    throw new Error("Invite code has expired");
  if (inviteCode.maxUses > 0 && inviteCode.currentUses >= inviteCode.maxUses)
    throw new Error("Invite code has reached its maximum uses");

  return {
    server: response,
    inviteIndex: index,
  };
};

const validateUsers = (user_ids: ObjectId[]) => {
  return (
    // Check if user_ids is not empty
    user_ids.length > 0 &&
    // Check if all members are unique
    new Set(user_ids).size === user_ids.length
  );
};

const addServerMemberTransaction = async ({
  server_id,
  user_ids,
}: ServerMembers) => {
  const session = await ServerMemberModel.startSession();
  session.startTransaction();

  try {
    if (!validateUsers(user_ids))
      throw new UserInputError("Invalid server member input!");

    // Check if user has been banned in the server.
    if (
      !(await ServerBansModel.find({
        server: server_id,
        user: { $in: user_ids },
      }))
    ) {
      throw new ForbiddenError("One of the user member in the list is banned!");
    }

    const res = await ServerMemberModel.insertMany(
      user_ids.map((user_id) => ({
        _id: { server_id, user_id },
      })),
      {
        session,
      }
    );
    await serverModel.updateOne(
      { _id: server_id },
      { $inc: { totalMembers: user_ids.length } },
      { session }
    );

    // assign default role to new members
    const defaultRole = await ServerRoleModel.findOne({ server_id, default: true });
    await AssignedUserRoleModel.create(
      user_ids.map((user_id) => ({
        _id: {
          server_role_id: defaultRole._id,
          user_id,
        },
      })),
      { session }
    );

    await session.commitTransaction();
    return res;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const removeServerMemberTransaction = async ({
  server_id,
  user_ids,
}: ServerMembers) => {
  const session = await ServerMemberModel.startSession();
  session.startTransaction();

  try {
    if (!validateUsers(user_ids))
      throw new UserInputError("Invalid server member input!");

    const server = await serverModel.findById(server_id);
    if (!server) throw new UserInputError("Server not found!");

    if (
      user_ids.some((user_id) => server.owner.toString() === user_id.toString())
    )
      throw new UserInputError("Owner cannot be removed!");

    const res = await ServerMemberModel.deleteMany({
      $or: user_ids.map((user_id) => ({
        "_id.server_id": server_id,
        "_id.user_id": user_id,
      })),
    });

    if (res.deletedCount === 0) throw new UserInputError("Member not found!");

    await serverModel.updateOne(
      { _id: server_id },
      { $inc: { totalMembers: -res.deletedCount } },
      { session }
    );

    await session.commitTransaction();
    return res;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const joinServerTransaction = async (url: string, user_id: ObjectId) => {
  const session = await ServerMemberModel.startSession();
  session.startTransaction();

  try {
    const { server, inviteIndex } = await validateInviteCode(url);

    // Check if user has been banned in the server.
    if (!(await ServerBansModel.exists({ server: server._id, user: user_id })))
      throw new ForbiddenError("User is banned!");

    const newdoc = {
      server_id: server._id,
      user_id,
    };

    await ServerMemberModel.create(
      [
        {
          _id: newdoc,
        },
      ],
      {
        session,
      }
    );

    server.totalMembers++;
    server.invite_code[inviteIndex].currentUses++;
    await server.save();

    await session.commitTransaction();
    return newdoc;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// =============================

const API: IResolvers = {
  Query: {
    getServerMembers: async (_, { server_id }) => {
      try {
        const res = await ServerMemberModel.find({
          "_id.server_id": server_id,
        });
        return res.map((member) => member._id);
      } catch (error) {
        throw new UserInputError(error.message);
      }
    },
    checkServerMember: async (_, { server_id, user_id }) => {
      try {
        return (
          (await ServerMemberModel.exists({
            "_id.server_id": server_id,
            "_id.user_id": user_id,
          })) !== null
        );
      } catch (error) {
        throw new UserInputError(error.message);
      }
    },
  },
  Mutation: {
    joinServer: async (_, { url, user_id }) => {
      try {
        if (!url) throw new UserInputError("Invite url is required!");
        if (!user_id) throw new UserInputError("User ID is required!");

        return await joinServerTransaction(url, user_id);
      } catch (error) {
        throw new UserInputError(error.message);
      }
    },
    addServerMembers: async (_, { input }) => {
      try {
        const res = await addServerMemberTransaction(input);
        await publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.memberAdded,
          server_id: input.server_id,
          data: input.user_ids,
        });
        return res.map((member) => member._id);
      } catch (error) {
        throw new UserInputError(error.message);
      }
    },
    removeServerMembers: async (_, { input }) => {
      try {
        await removeServerMemberTransaction(input);
        await publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.memberRemoved,
          server_id: input.server_id,
          data: input.user_ids,
        });
        return true;
      } catch (error) {
        throw new UserInputError(error.message);
      }
    },
  },
};

export default { API };
