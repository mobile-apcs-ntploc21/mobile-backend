import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { UserInputError } from "apollo-server";
import { combineResolvers } from "graphql-resolvers";
import { IResolvers } from "@graphql-tools/utils";

import UserModel from "../../models/user";
import { defaultSettings } from "./userSettings";
import { defaultProfile } from "./user_profile";
import UserSettingsModel from "../../models/userSettings";
import UserProfileModel from "../../models/user_profile";
import UserStatusModel from "../../models/user_status";
import SubscriptionsModel from "@/models/payment/subscriptions";
import { log } from "@/utils/log";
import Device from "@models/device";

const createUserTransaction = async (input: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create user account
    const opts = { session, new: true };
    const [createdUser] = await UserModel.create([input], opts);

    // Create user settings
    await UserSettingsModel.create(
      [{ user_id: createdUser.id, settings: JSON.stringify(defaultSettings) }],
      opts
    );

    // Create user profile
    await UserProfileModel.create(
      [
        {
          user_id: createdUser.id,
          server_id: null,
          display_name: createdUser.username,
          username: createdUser.username,
          about_me: defaultProfile.about_me,
          avatar_url: "",
          banner_url: "",
        },
      ],
      opts
    );

    // Create user status
    await UserStatusModel.create(
      [
        {
          user_id: createdUser.id,
        },
      ],
      opts
    );

    // Create user subscription
    await SubscriptionsModel.create(
      [
        {
          user_id: createdUser.id,
          package_id: null,
          is_active: false,
          start_date: null,
          end_date: null,
        },
      ],
      opts
    );

    await session.commitTransaction();
    return createdUser;
  } catch (error) {
    await session.abortTransaction();
    log.error(error);
    throw new UserInputError("Cannot create user !");
  } finally {
    session.endSession();
  }
};

const clearExpireTokens = async (user: any) => {
  const currentTime = Date.now();
  const tokens = user.refresh_tokens.filter(
    (token: any) => currentTime - token.created_at <= 7 * 24 * 60 * 60 * 1000 // 7 days
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

    loginUser: combineResolvers(
      async (_, { email, password, device_token }, { models }) => {
        const user = await UserModel.findOne({ email });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return null;
        }

        clearExpireTokens(user);

        await Device.findOneAndUpdate(
          { user_id: user._id },
          { $addToSet: { device_tokens: device_token } },
          { upsert: true, new: true }
        );

        return user;
      }
    ),

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
      try {
        const user = await createUserTransaction(input);
        return user;
      } catch (err) {
        throw new UserInputError("Cannot create user !");
      }
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
