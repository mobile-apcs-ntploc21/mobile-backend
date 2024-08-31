import {IResolvers} from "@graphql-tools/utils";
import {UserInputError} from "apollo-server";
import ChannelUserPermission from "../../../../models/servers/channels/channel_user_permission"
import mongoose, {ObjectId} from "mongoose";
import {publishEvent, ServerEvents} from "../../../pubsub/pubsub";
import Channel from "../../../../models/servers/channels/channel";
import UserModel from "../../../../models/user";
import {defaultChannelRole} from "./channel_role_permission";
import UserProfileModel from "@models/user_profile";

const createChannelUserPermission = async (user_id: ObjectId, channel_id: ObjectId,  permissions: String ) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  if (!permissions) {
    permissions = defaultChannelRole;
  }
  try {
    if (!UserModel.findById(user_id).session(session)) {
      throw new UserInputError("User not found");
    }

    if (!Channel.findById(channel_id).session(session)) {
      throw new UserInputError("Channel not found");
    }

    // check if user is already assigned with the channel
    if (await ChannelUserPermission.exists({
      '_id.user_id': user_id,
      '_id.channel_id': channel_id
    })) {
      throw new UserInputError("Server role is already assigned to channel permissions!");
    }

    const channel_user_permission = await ChannelUserPermission.create({
      _id: {
        user_id,
        channel_id
      },
      permissions,
    });

    await session.commitTransaction();
    await session.endSession();

    return channel_user_permission;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();

    throw error;
  }
};

const channelUserPermissionAPI: IResolvers = {
  Query: {
    syncChannelUserPermission: async (_, __, { user }) => {
      try {
        // empty
        return await ChannelUserPermission.find();
      } catch (err) {
        throw new UserInputError("Cannot sync channel permissions for users!");
      }
    },
    getChannelUsersPermissions: async (_, { channel_id }) => {
      try {
        const channel = await Channel.findById(channel_id);
        if (!channel) {
          throw new UserInputError("Channel not found");
        }
        const server_id = channel.server_id;

        const channelUsers = await ChannelUserPermission.find({
          '_id.channel_id': channel_id,
        });

        // Use Promise.all to fetch all users
        return await Promise.all(channelUsers.map(async (channelUser) => {
          const user_id = channelUser._id.user_id;
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
            permissions: channelUser.permissions,
          };
        }));

      } catch (err) {
        throw new UserInputError("Cannot get channel permissions associated with this user!");
      }
    },
    getChannelUserPermission: async (_, { user_id, channel_id }) => {
      try {
        const channel = await Channel.findById(channel_id);
        if (!channel) {
          throw new UserInputError("Channel not found");
        }
        const server_id = channel.server_id;

        const channel_user_permission = await ChannelUserPermission.findOne({
          '_id.user_id': user_id,
          '_id.channel_id': channel_id
        });

        if (!channel_user_permission) {
          throw new UserInputError("Channel user permission not found");
        }

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
          permissions: channel_user_permission.permissions,
        };
      } catch (err) {
        throw new UserInputError("Cannot get channel permissions associated with this user!");
      }
    },
  },
  Mutation: {
    createChannelUserPermission: async (_, { user_id, channel_id, permissions }) => {
      try {

        const channel_user_permission = await createChannelUserPermission(user_id, channel_id, permissions);

        const channel = await Channel.findById(channel_id);

        publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.channelUserAdded,
          server_id: channel.server_id,
          data: {
            ...channel_user_permission.toObject(),
          },
        });

        const channelUsers = await ChannelUserPermission.find({
          '_id.channel_id': channel_id
        });

        return await Promise.all(channelUsers.map(async (channelUser) => {
          const user_id = channelUser._id.user_id;
          let user = await UserProfileModel.findOne({
            user_id: user_id,
            server_id: channel.server_id,
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
            permissions: channelUser.permissions
          };
        }));
      } catch (error) {
        throw new UserInputError("Cannot create channel permissions for user!");
      }

    },
    updateChannelUserPermission: async (_, { user_id, channel_id, permissions }) => {
      try {
        const channel = await Channel.findById(channel_id);
        if (!channel) {
          throw new UserInputError("Channel not found");
        }
        const server_id = channel.server_id;

        const channel_user_permission = await ChannelUserPermission.findOneAndUpdate(
          {
            '_id.user_id': user_id,
            '_id.channel_id': channel_id
          },
          {permissions},
          {new: true}
        );

        publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.channelUserUpdated,
          server_id: channel.server_id,
          data: {
            ...channel_user_permission.toObject(),
          },
        });

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
          permissions: channel_user_permission.permissions,
        };
      } catch (error) {
        throw new UserInputError("Cannot update channel permissions for user!");
      }
    },
    deleteChannelUserPermission: async (_, { user_id, channel_id }) => {
      try {
        const channel_user_permission = await ChannelUserPermission.findOneAndDelete({
          '_id.user_id': user_id,
          '_id.channel_id': channel_id
        });

        const channel = await Channel.findById(channel_id);

        publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.channelUserDeleted,
          server_id: channel.server_id,
          data: {
            ...channel_user_permission.toObject(),
          },
        });

        const channelUsers = await ChannelUserPermission.find({
          '_id.channel_id': channel_id
        });

        return await Promise.all(channelUsers.map(async (channelUser) => {
          const user_id = channelUser._id.user_id;
          let user = await UserProfileModel.findOne({
            user_id: user_id,
            server_id: channel.server_id,
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
            permissions: channelUser.permissions
          };
        }));
      } catch (error) {
        throw new UserInputError("Cannot delete channel permissions for user!");
      }
    },
  },
};

export default { API: channelUserPermissionAPI };
