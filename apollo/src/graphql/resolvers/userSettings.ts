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
    getUserSettings: async (_, { userId }) => {
      const userSettings = await UserSettingsModel.findOne({ userId });
      if (!userSettings) {
        throw new UserInputError("User settings not found!");
      }
      return userSettings;
    },
  },
  Mutation: {
    createUserSettings: async (_, { input }) => {
      const { userId, settings } = input;
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new UserInputError("User not found!");
      }
      const userSettings = await UserSettingsModel.create({ userId, settings });
      return userSettings;
    },
    updateUserSettings: async (_, { input }) => {
      const { userId, settings } = input;
      const userSettings = await UserSettingsModel.findOneAndUpdate(
        { userId },
        { settings },
        { new: true }
      );
      if (!userSettings) {
        throw new UserInputError("User settings not found!");
      }
      return userSettings;
    },
    deleteUserSettings: async (_, { userId }) => {
      const userSettings = await UserSettingsModel.findOneAndDelete({ userId });
      if (!userSettings) {
        throw new UserInputError("User settings not found!");
      }
      return userSettings;
    },
    restoreUserSettings: async (_, { userId }) => {
      const userSettings = await UserSettingsModel.findOneAndUpdate(
        { userId },
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
