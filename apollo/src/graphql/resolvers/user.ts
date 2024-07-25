import { UserInputError, AuthenticationError } from "apollo-server";
import { combineResolvers } from "graphql-resolvers";
import bcrypt from "bcryptjs";
import { IResolvers } from "@graphql-tools/utils";

import UserModel from "../../models/user";
import UserSettingsModel from "../../models/userSettings";
import { defaultSettings } from "./userSettings";

const clearExpireTokens = async (user) => {
  const currentTime = Date.now();
  const tokens = user.refresh_tokens.filter(
    (token) => currentTime - token.created_at <= 7 * 24 * 60 * 60 * 1000 // 7 days
  );

  user.refresh_tokens = tokens;
  await user.save();
};

const userResolvers: IResolvers = {
  Query: {
    users: combineResolvers(async (_, __, { models }) => {
      const users = await models.UserModel.findAll();
      if (!users) {
        throw new UserInputError("No user found !");
      }
      return users;
    }),

    getUserById: combineResolvers(async (_, { id }, { models }) => {
      const user = await UserModel.findById(id);
      if (!user) {
        return null;
      }
      return user;
    }),

    getUserByEmail: combineResolvers(async (_, { email }, { models }) => {
      const user = await UserModel.findOne({ email });
      if (!user) {
        return null;
      }
      return user;
    }),

    getUserByUsername: combineResolvers(async (_, { username }, { models }) => {
      const user = await UserModel.findOne({ username });
      if (!user) {
        return null;
      }
      return user;
    }),

    loginUser: combineResolvers(async (_, { email, password }, { models }) => {
      const user = await UserModel.findOne({ email });

      if (!user) {
        return null;
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return null;
      }

      clearExpireTokens(user);
      return user;
    }),

    logoutUser: combineResolvers(
      async (_, { refresh_token, id }, { models }) => {
        if (!id || !refresh_token) {
          return false;
        }

        try {
          await UserModel.updateOne(
            { _id: id },
            { $pull: { refresh_tokens: { token: refresh_token } } }
          );

          return true;
        } catch (error) {
          return false;
        }
      }
    ),
  },
  Mutation: {
    createUser: combineResolvers(async (_, { input }, { models }) => {
      const user = await UserModel.create(input);

      if (!user) {
        throw new UserInputError("Cannot create user !");
      }

      // Create default settings
      await UserSettingsModel.create({
        userId: user.id,
        settings: defaultSettings,
      });

      return user;
    }),

    updateRefreshToken: combineResolvers(async (_, { input }, { models }) => {
      const user = await UserModel.findOne({ email: input.email });

      if (!user) {
        throw new UserInputError("User not found !");
      }

      clearExpireTokens(user);
      await UserModel.updateOne(
        { _id: user.id },
        { $pull: { refresh_tokens: { token: input.old_token } } }
      );

      await UserModel.updateOne(
        { _id: user.id },
        { $push: { refresh_tokens: { token: input.token } } }
      );

      return user;
    }),
  },
};

export default userResolvers;
