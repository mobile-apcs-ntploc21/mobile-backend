import mongoose, { Error, MongooseError } from "mongoose";
import { IResolvers } from "@graphql-tools/utils";
import { PubSub, withFilter } from "graphql-subscriptions";
import { AuthenticationError, UserInputError } from "apollo-server";

import ServerModel from "../../../models/server";
import CategoryModel from "../../../models/Channel/category";
import CategoryPermissionModel from "../../../models/Channel/category_permission";

const resolvers: IResolvers = {
  Query: {
    getCategoryPermissions: async (_, { category_id }) => {
      try {
        const permissions = await CategoryPermissionModel.find({ category_id });
        return permissions;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  Mutation: {
    createCategoryPermission: async (_, { category_id, input }) => {
      try {
        const permission = await CategoryPermissionModel.create({
          category_id,
          ...input,
        });
        return permission;
      } catch (error) {
        throw new Error(error);
      }
    },
    updateCategoryPermission: async (_, { category_id, input }) => {
      try {
        const permission = await CategoryPermissionModel.findOneAndUpdate(
          { category_id },
          input,
          { new: true }
        );
        return permission;
      } catch (error) {
        throw new Error(error);
      }
    },
    deleteCategoryPermission: async (_, { id }) => {
      try {
        // Check if permission is @everyone
        const permission = await CategoryPermissionModel.findById(id);
        if (!permission) {
          throw new Error("Permission not found!");
        }

        if (!permission.server_role_id && permission.is_user === false) {
          throw new Error("Cannot delete @everyone permission");
        }

        await CategoryPermissionModel.findByIdAndDelete(id);
        return true;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};

export default resolvers;
