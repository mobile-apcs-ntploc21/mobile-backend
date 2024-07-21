import { IResolvers } from "@graphql-tools/utils";
import { UserInputError } from "apollo-server";
import UserSettingsModel from "../../models/userSettings";
import UserModel from "../../models/user";

export const defaultSettings = JSON.stringify({
  // Appearance
  theme: "light",
  language: "en",

  // Friend requests
  friendReqFromEveryone: true, // Allow friend requests from everyone
  friendReqFromFoFriends: true, // Allow friend requests from friends of friends
  friendReqFromServer: true, // Allow friend requests from server members

  // Notification
  enableNotif: true, // Enable notifications
  notifSound: true, // Enable notification sound

  // TODO: Add more later
});

const userSettingsResolvers: IResolvers = {
  Query: {
    syncUserSettings: async (_, __, { user }) => {
      try {
        const users = await UserModel.find();
        const userSettings = users.map(async (user) => {
          const userSettings = await UserSettingsModel.findOne({
            user_id: user._id,
          });

          if (!userSettings) {
            const _defaultSettings = {
              user_id: user._id,
              settings: defaultSettings,
            };

            return await UserSettingsModel.create(_defaultSettings);
          }

          return userSettings;
        });

        return userSettings;
      } catch (err) {
        throw new UserInputError("Cannot sync user settings!");
      }
    },
    getUserSettings: async (_, { user_id }) => {
      const userSettings = await UserSettingsModel.findOne({ user_id });
      if (!userSettings) {
        throw new UserInputError("User settings not found!");
      }
      return userSettings;
    },
  },
  Mutation: {
    createUserSettings: async (_, { input }) => {
      let { user_id, settings } = input;
      if (!settings) {
        settings = defaultSettings;
      }
      const user = await UserModel.findById(user_id);
      if (!user) {
        throw new UserInputError("User not found!");
      }
      const userSettings = await UserSettingsModel.create({
        user_id,
        settings,
      });
      return userSettings;
    },
    updateUserSettings: async (_, { input }) => {
      const { user_id, settings } = input;
      const userSettings = await UserSettingsModel.findOneAndUpdate(
        { user_id },
        { settings },
        { new: true }
      );
      if (!userSettings) {
        throw new UserInputError("User settings not found!");
      }
      return userSettings;
    },
    deleteUserSettings: async (_, { user_id }) => {
      const userSettings = await UserSettingsModel.findOneAndDelete({
        user_id,
      });
      if (!userSettings) {
        throw new UserInputError("User settings not found!");
      }
      return userSettings;
    },
    restoreUserSettings: async (_, { user_id }) => {
      const userSettings = await UserSettingsModel.findOneAndUpdate(
        { user_id },
        { settings: defaultSettings },
        { new: true }
      );
      if (!userSettings) {
        throw new UserInputError("User settings not found!");
      }
      return userSettings;
    },
  },
};

export default userSettingsResolvers;
