import { IResolvers } from "@graphql-tools/utils";
import { UserInputError } from "apollo-server";
import { PubSub } from "graphql-subscriptions";
import { GraphQLScalarType, Kind } from "graphql";
import mongoose from "mongoose";

import UserModel from "../../models/user";
import UserProfileModel from "../../models/user_profile";

const pubsub = new PubSub();

export const defaultProfile = {
  server_id: null,
  display_name: "",
  about_me: "",
  avatar_url: "",
  banner_url: "",
};

const ObjectId = new GraphQLScalarType({
  name: "ObjectId",
  description: "Mongo object id scalar type",
  parseValue(value: string) {
    return new mongoose.Types.ObjectId(value);
  },
  serialize(value: mongoose.Types.ObjectId) {
    return value.toHexString();
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new mongoose.Types.ObjectId(ast.value);
    }
    return null;
  },
});

const userProfileApollo: IResolvers = {
  ObjectId,
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

      const user = await UserModel.findOne({ _id: user_id });
      if (!user) {
        throw new UserInputError("User with that userId not found.");
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
    },

    updateUserProfile: async (_, args) => {
      const {
        user_id,
        server_id,
        display_name,
        about_me,
        avatar_url,
        banner_url,
      } = args.input;

      const userProfile = await UserProfileModel.findOneAndUpdate(
        { user_id, server_id }, // Find the user profile by user_id and server_id
        {
          display_name,
          about_me,
          avatar_url,
          banner_url,
        },
        { new: true }
      );

      if (!userProfile) {
        throw new UserInputError("User profile with that userId not found.");
      }

      pubsub.publish(
        `USER_PROFILE_UPDATED ${userProfile._id} ${server_id || "null"}`,
        {
          userProfileUpdated: userProfile,
        }
      );

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
  ObjectId,
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
