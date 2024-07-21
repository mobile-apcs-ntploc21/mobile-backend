import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { UserInputError } from "apollo-server";
import { combineResolvers } from "graphql-resolvers";
import { IResolvers } from "@graphql-tools/utils";

import UserModel from "../../models/user";
import UserSettingsModel from "../../models/userSettings";
import { defaultSettings } from "./userSettings";
import UserProfileModel from "../../models/user_profile";
import { defaultProfile } from "./user_profile";

const createUserTransaction = async (input) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create user account
    const opts = { session, new: true };
    const [createdUser] = await UserModel.create([input], opts);

    // Create user settings
    await UserSettingsModel.create(
      [{ user_id: createdUser._id, settings: JSON.stringify(defaultSettings) }],
      opts
    );

    // Create user profile
    await UserProfileModel.create(
      [
        {
          user_id: createdUser._id,
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

    await session.commitTransaction();
    return createdUser;
  } catch (error) {
    await session.abortTransaction();
    throw new UserInputError("Cannot create user !");
  } finally {
    session.endSession();
  }
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

      return user;
    }),
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

      user.token = input.token;
      await user.save();
      return user;
    }),
  },
};

export default userResolvers;

// Use to initialize missing user settings
// const initializeMissingUserSettings = async () => {
//   const users = await UserModel.find();

//   for (const user of users) {
//     let existingSettings = await UserSettingsModel.findOne({
//       userId: user._id,
//     });

//     if (!existingSettings) {
//       const newUserSettings = new UserSettingsModel({
//         userId: user._id,
//         settings: defaultSettings,
//       });
//       await newUserSettings.save();
//       console.log(`Initialized settings for user: ${user._id}`);
//     } else {
//       // Parse the existing settings
//       const parsedExistingSettings = JSON.parse(existingSettings.settings);
//       const defaultSettingsParsed = JSON.parse(defaultSettings);

//       // Find missing key in the existing settings
//       const needsUpdate = Object.keys(defaultSettingsParsed).some(
//         (key) => !(key in parsedExistingSettings)
//       );

//       if (!needsUpdate) {
//         continue;
//       }

//       // Merge the existing settings with the default settings
//       const mergedSettings = {
//         ...defaultSettingsParsed,
//         ...parsedExistingSettings,
//       };

//       // Update the existing settings with the merged settings
//       existingSettings.settings = JSON.stringify(mergedSettings);
//       await existingSettings.save();
//       console.log(`Updated settings for user: ${user._id}`);
//     }
//   }
// };

// initializeMissingUserSettings()
//   .then(() => console.log("Initialization complete"))
//   .catch((err) => console.error("Error initializing settings:", err));
