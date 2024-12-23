import { IResolvers } from "@graphql-tools/utils";
import { UserInputError } from "apollo-server";
import { PubSub } from "graphql-subscriptions";

import UserModel from "../../models/user";
import UserProfileModel from "../../models/user_profile";
import { publishEvent, ServerEvents } from "../pubsub/pubsub";
import ServerMemberModel from "@/models/servers/server_member";

const pubsub = new PubSub();

export const defaultProfile = {
  server_id: null,
  display_name: "",
  about_me: "",
  avatar_url: "",
  banner_url: "",
};

const userProfileApollo: IResolvers = {
  Query: {
    syncUserProfile: async () => {
      // Create a default profile for the user if it doesn't exist
      try {
        const users = await UserModel.find();
        const userProfiles = users.map(async (user) => {
          const userProfile = await UserProfileModel.findOne({
            user_id: user._id,
          });

          if (!userProfile) {
            const defaultProfile = {
              user_id: user._id,
              server_id: null,
              display_name: user.username,
              username: user.username,
              about_me: "",
              avatar_url: "",
              banner_url: "",
            };

            return await UserProfileModel.create(defaultProfile);
          }

          return userProfile;
        });

        return userProfiles;
      } catch (error) {
        throw new Error("Error syncing user profiles.");
      }
    },

    getUserProfile: async (_, { user_id, server_id }) => {
      // TODO: Implement populate "OnlineStatus" to get the status
      const userProfile = await UserProfileModel.findOne({
        user_id,
        server_id,
      });

      return userProfile || null;
    },

    getUserProfileByUsername: async (_, { username }) => {
      const user = await UserModel.findOne({ username });
      if (!user) {
        throw new UserInputError("User with that username not found.");
      }

      const userProfile = await UserProfileModel.findOne({ user_id: user._id });
      return userProfile || null;
    },
  },
  Mutation: {
    createUserProfile: async (_, args) => {
      // TODO: Implement populate "OnlineStatus" to get the status
      const {
        user_id,
        server_id,
        display_name,
        about_me,
        avatar_url,
        banner_url,
      } = args.input;

      try {
        const user = await UserModel.findOne({ _id: user_id });
        if (!user) {
          throw new UserInputError("User with that user_id not found.");
        }

        const username = user.username;

        const userProfile = await UserProfileModel.create({
          user_id,
          server_id: server_id || defaultProfile.server_id,
          display_name: display_name || username,
          username,
          about_me: about_me || defaultProfile.about_me,
          avatar_url: avatar_url || defaultProfile.avatar_url,
          banner_url: banner_url || defaultProfile.banner_url,
        });

        return userProfile;
      } catch (error) {
        throw new UserInputError(
          "Error creating user profile. Please check any duplicated field."
        );
      }
    },

    updateUserProfile: async (_, args) => {
      const { user_id, server_id } = args.input;
      const input: {
        display_name?: string;
        about_me?: string;
        avatar_url?: string;
        banner_url?: string;
      } = args.input;

      const userProfile = await UserProfileModel.findOneAndUpdate(
        { user_id, server_id }, // Find the user profile by user_id and server_id
        input, // Update the user profile with the input
        { new: true }
      );

      if (!userProfile) {
        throw new UserInputError(
          "User profile with that userId and server_id not found."
        );
      }

      pubsub.publish(
        `USER_PROFILE_UPDATED ${userProfile._id} ${server_id || "null"}`,
        {
          userProfileUpdated: userProfile,
        }
      );

      // Publish event in servers
      const serverMember = await ServerMemberModel.find({
        "_id.user_id": user_id,
      }).lean();

      for (const server of serverMember) {
        publishEvent(ServerEvents.userProfileChanged, {
          server_id: String(server._id.server_id) || null,
          user_id: userProfile.user_id,
          type: ServerEvents.userProfileChanged,
          data: userProfile,
        });
      }

      return userProfile;
    },

    deleteUserProfile: async (_, { user_id, server_id }) => {
      const userProfile = await UserProfileModel.findOneAndDelete({
        user_id,
        server_id,
      });

      if (!userProfile) {
        throw new UserInputError("User profile with that userId not found.");
      }

      return userProfile;
    },
  },
};

const userProfileWs: IResolvers = {
  Subscription: {
    userProfileUpdated: {
      subscribe: async (_, { user_id, server_id }) => {
        try {
          const userProfile = await UserProfileModel.findOne({
            user_id: user_id,
            server_id: server_id || defaultProfile.server_id,
          });
          if (!userProfile) {
            throw new UserInputError(
              "User profile with that userId not found."
            );
          }
          return pubsub.asyncIterator(
            `USER_PROFILE_UPDATED ${userProfile._id} ${server_id || "null"}`
          );
        } catch (err) {
          throw new Error(
            "Error subscribing to user profile updates. Maybe check the user ID or the result of the query."
          );
        }
      },
    },
  },
};

export { userProfileApollo, userProfileWs };
