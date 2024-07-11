import { UserInputError } from "apollo-server";
import { combineResolvers } from "graphql-resolvers";
import UserModel from "../../models/user";
import bcrypt from "bcryptjs";

const userResolvers = {
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
        throw new UserInputError("Cannot create user !");
      }
      return user;
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
