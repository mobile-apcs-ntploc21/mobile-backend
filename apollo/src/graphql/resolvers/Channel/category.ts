import mongoose, { Error, MongooseError } from "mongoose";
import { IResolvers } from "@graphql-tools/utils";
import { PubSub, withFilter } from "graphql-subscriptions";
import { AuthenticationError, UserInputError } from "apollo-server";

import ServerModel from "../../../models/server";
import CategoryModel from "../../../models/Channel/category";
import CategoryPermissionModel from "../../../models/Channel/category_permission";

const resolvers: IResolvers = {
  Query: {
    getCategory: async (_, { category_id }) => {
      try {
        const category = await CategoryModel.findById(category_id);
        return category;
      } catch (error) {
        throw new Error(error);
      }
    },
    getCategories: async (_, { server_id }) => {
      try {
        const categories = await CategoryModel.find({ server_id });
        return categories;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  Mutation: {
    createCategory: async (_, { server_id, input }) => {
      const { name, is_private } = input;

      try {
        // Get the last position of the categories
        let position = 0;
        const categories = await CategoryModel.find({
          server_id: server_id,
        });
        if (categories.length > 0) {
          position = categories.length;
        }

        // Create the category
        const category = await CategoryModel.create({
          server_id,
          name,
          position,
          private: {
            is_private: is_private,
          },
        });

        return category;
      } catch (error) {
        throw new Error(error);
      }
    },
    updateCategory: async (_, { category_id, input }) => {
      try {
        const category = await CategoryModel.findByIdAndUpdate(
          category_id,
          input,
          { new: true }
        );
        return category;
      } catch (error) {
        throw new Error(error);
      }
    },
    deleteCategory: async (_, { category_id }) => {
      try {
        const category = await CategoryModel.findByIdAndDelete(category_id);
        return category;
      } catch (error) {
        throw new Error(error);
      }
    },

    moveCategory: async (_, { category_id, new_position }) => {
      try {
        const category = await CategoryModel.findById(category_id);

        if (!category) {
          throw new UserInputError("Category not found");
        }

        const old_position = category.position;

        // Increment or decrement the position of the categories
        if (old_position < new_position) {
          await CategoryModel.updateMany(
            {
              server_id: category.server_id,
              position: { $gt: old_position, $lte: new_position },
            },
            { $inc: { position: -1 } }
          );
        } else {
          await CategoryModel.updateMany(
            {
              server_id: category.server_id,
              position: { $lt: old_position, $gte: new_position },
            },
            { $inc: { position: 1 } }
          );
        }

        // Update the position of the category
        category.position = new_position;
        await category.save();

        return category;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};

export default resolvers;
