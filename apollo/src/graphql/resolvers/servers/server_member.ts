import { IResolvers } from '@graphql-tools/utils';
import { UserInputError } from 'apollo-server-core';
import { ObjectId, Schema } from 'mongoose';
import { publishEvent, ServerEvents } from '../../pubsub/pubsub';

import UserStatusModel from '@/models/user_status';
import UserProfileModel from '@/models/user_profile';
import serverModel from '../../../models/servers/server';
import ServerMemberModel from '../../../models/servers/server_member';
import ServerBan from '@/models/servers/server_bans';
import ServerRoleModel from '../../../models/servers/server_role';
import AssignedUserRoleModel from '../../../models/servers/assigned_user_role';

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
  if (!url) throw new Error('Invite code URL is required');

  const response = await serverModel.findOne({
    invite_code: {
      $elemMatch: { url },
    },
  });

  if (!response) throw new Error('This server does not have any invite codes');

  const inviteCodes = response.invite_code;
  const index = inviteCodes.findIndex((code: InviteCode) => code.url === url);
  const inviteCode = inviteCodes[index];

  if (inviteCode.expiredAt && new Date(inviteCode.expiredAt) < new Date())
    throw new Error('Invite code has expired');
  if (inviteCode.maxUses > 0 && inviteCode.currentUses >= inviteCode.maxUses)
    throw new Error('Invite code has reached its maximum uses');

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
      throw new UserInputError('Invalid server member input!');

    // Filter out banned users
    const bannedUsers = await ServerBan.find({
      '_id.server_id': server_id,
      '_id.user_id': { $in: user_ids },
    });
    const filteredUsers = user_ids.filter(
      (user_id) =>
        !bannedUsers.some((ban) => String(ban._id.user_id) === String(user_id))
    );

    // Add members to the server and update totalMembers count
    const res = await ServerMemberModel.insertMany(
      filteredUsers.map((user_id) => ({
        _id: { server_id, user_id },
      })),
      {
        session,
      }
    );
    await serverModel.updateOne(
      { _id: server_id },
      { $inc: { totalMembers: filteredUsers.length } },
      { session }
    );

    // assign default role to new members
    const defaultRole = await ServerRoleModel.findOne({
      server_id,
      default: true,
    });
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
      throw new UserInputError('Invalid server member input!');

    const server = await serverModel.findById(server_id);
    if (!server) throw new UserInputError('Server not found!');

    if (
      user_ids.some((user_id) => server.owner.toString() === user_id.toString())
    )
      throw new UserInputError('Owner cannot be removed!');

    const res = await ServerMemberModel.deleteMany({
      $or: user_ids.map((user_id) => ({
        '_id.server_id': server_id,
        '_id.user_id': user_id,
      })),
    });

    if (res.deletedCount === 0) throw new UserInputError('Member not found!');

    await serverModel.updateOne(
      { _id: server_id },
      { $inc: { totalMembers: -res.deletedCount } },
      { session }
    );

    // Remove assigned roles
    // Get all roles in the server
    const roles = await ServerRoleModel.find({
      server_id,
    });

    // Get all assigned roles
    const assignedRoles = await AssignedUserRoleModel.find({
      '_id.server_role_id': { $in: roles.map((role) => role._id) },
      '_id.user_id': { $in: user_ids },
    });

    // Delete assigned roles
    await AssignedUserRoleModel.deleteMany({
      '_id.server_role_id': { $in: roles.map((role) => role._id) },
      '_id.user_id': { $in: user_ids },
    });

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

    // Check user has been banned
    const bannedUser = await ServerBan.findOne({
      '_id.server_id': server._id,
      '_id.user_id': user_id,
    });
    if (bannedUser) {
      throw new Error('You are banned from this server!');
    }

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
    getServerMembers: async (_, { server_id, limit }) => {
      // Set default limit to 1000
      if (!limit) {
        limit = 1000;
      }

      try {
        // Get all members of the server
        const members = await ServerMemberModel.find({
          '_id.server_id': server_id,
        }).limit(limit);

        // Get the user profile of each member (contains default and server profile)
        const user_ids = members.map((member) => member._id.user_id);
        const allProfiles = await UserProfileModel.find({
          user_id: { $in: user_ids },
          server_id: { $in: [null, server_id] },
        });
        const allStatuses = await UserStatusModel.find({
          user_id: { $in: user_ids },
        });

        let profiles = [];
        for (let i = 0; i < user_ids.length; i++) {
          let profile = allProfiles.find(
            (profile) =>
              String(profile.user_id) === String(user_ids[i]) &&
              String(profile.server_id) === server_id
          );

          let status = allStatuses.find(
            (status) => String(status.user_id) === String(user_ids[i])
          );

          if (!profile) {
            profile = allProfiles.find(
              (profile) => String(profile.user_id) === String(user_ids[i])
            );
          }

          profiles.push({
            id: profile._id,
            user_id: profile.user_id,
            display_name: profile.display_name,
            username: profile.username,
            about_me: profile.about_me,
            avatar_url: profile.avatar_url,
            banner_url: profile.banner_url,
            status: status,
          });
        }

        return profiles;
      } catch (error) {
        throw new UserInputError(error.message);
      }
    },
    checkServerMember: async (_, { server_id, user_id }) => {
      try {
        return (
          (await ServerMemberModel.exists({
            '_id.server_id': server_id,
            '_id.user_id': user_id,
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
        if (!url) throw new UserInputError('Invite url is required!');
        if (!user_id) throw new UserInputError('User ID is required!');

        const res = await joinServerTransaction(url, user_id);
        publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.memberJoined,
          server_id: res.server_id,
          data: res.user_id,
        });
        return res;
      } catch (error) {
        throw new UserInputError(error.message);
      }
    },
    addServerMembers: async (_, { input }) => {
      try {
        const res = await addServerMemberTransaction(input);
        publishEvent(ServerEvents.serverUpdated, {
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
        publishEvent(ServerEvents.serverUpdated, {
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
