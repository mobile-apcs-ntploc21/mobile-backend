import { IResolvers } from "@graphql-tools/utils";
import { UserInputError } from "apollo-server";
import { GraphQLScalarType, Kind } from "graphql";
import mongoose from "mongoose";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

import UserModel from "@/models/user";
import UserProfileModel from "@/models/user_profile";
import { s3, streamToBuffer, uploadToS3 } from "@/utils/aws";

const optimizeImage = async (buffer: Buffer) => {
  const optimizedImage = await sharp(buffer)
    .resize(512, 512, {
      fit: "cover",
      position: "center",
    })
    .jpeg()
    .toBuffer();

  return optimizedImage;
};

export const defaultProfile = {
  server_id: null,
  display_name: "",
  about_me: "",
  avatar_url: "",
  banner_url: "",
  status: null,
};

const userProfileResolvers: IResolvers = {
  ObjectId: new GraphQLScalarType({
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
  }),

  Query: {
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
        status,
      } = args;
      const user = await UserModel.findOne({ _id: user_id });
      if (!user) {
        throw new UserInputError("User not found.");
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
        status: status || defaultProfile.status,
      });

      return userProfile;
    },

    updateUserProfile: async (_, args) => {
      const { user_id, server_id, display_name, about_me, status } = args;

      const userProfile = await UserProfileModel.findOneAndUpdate(
        { user_id, server_id }, // Find the user profile by user_id and server_id
        {
          display_name,
          about_me,
          status,
        },
        { new: true }
      );

      if (!userProfile) {
        throw new UserInputError("User profile not found.");
      }

      return userProfile;
    },

    updateUserProfileAvatar: async (_, { user_id, server_id, file }) => {
      // Check if user exists
      if (!UserModel.findOne({ user_id })) {
        throw new UserInputError("User not found.");
      }

      // TODO: Process the file and upload it to the cloud storage
      const { createReadStream } = await file;
      const stream = createReadStream();
      const buffer = await streamToBuffer(stream);
      const optimizedImage = await optimizeImage(buffer);
      const url = await uploadToS3(optimizedImage, "avatars");

      const userProfile = await UserProfileModel.findOneAndUpdate(
        { user_id, server_id },
        {
          avatar_url: url,
        },
        { new: true }
      );

      if (!userProfile) {
        throw new UserInputError("User profile not found.");
      }

      return userProfile;
    },

    updateUserProfileBanner: async (_, { user_id, server_id, file }) => {
      // Check if user exists
      if (!UserModel.findOne({ user_id })) {
        throw new UserInputError("User not found.");
      }

      // TODO: Process the file and upload it to the cloud storage
      const { createReadStream } = await file;
      const stream = createReadStream();
      const buffer = await streamToBuffer(stream);
      const optimizedImage = await optimizeImage(buffer);
      const url = await uploadToS3(optimizedImage, "avatars");

      const userProfile = await UserProfileModel.findOneAndUpdate(
        { user_id, server_id },
        {
          background_url: url,
        },
        { new: true }
      );

      if (!userProfile) {
        throw new UserInputError("User profile not found.");
      }

      return userProfile;
    },

    deleteUserProfile: async (_, { user_id, server_id }) => {
      const userProfile = await UserProfileModel.findOneAndDelete({
        user_id,
        server_id,
      });

      if (!userProfile) {
        throw new UserInputError("User profile not found.");
      }

      return userProfile;
    },
  },
};

export default userProfileResolvers;
