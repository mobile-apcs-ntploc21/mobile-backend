import { UserInputError } from 'apollo-server';
import { combineResolvers } from 'graphql-resolvers';
import bcrypt from 'bcryptjs';
import { IResolvers } from '@graphql-tools/utils';

import UserModel from "../../models/user";
import UserSettingsModel from "../../models/userSettings";
import { defaultSettings } from "./userSettings";

const userResolvers: IResolvers = {
  Query: {
    users: combineResolvers(async (_, __, { models }) => {
      const users = await models.UserModel.findAll();
      if (!users) {
        throw new UserInputError('No user found !');
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
      const user = await UserModel.create(input);

      if (!user) {
        throw new UserInputError('Cannot create user !');
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
        throw new UserInputError('User not found !');
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
