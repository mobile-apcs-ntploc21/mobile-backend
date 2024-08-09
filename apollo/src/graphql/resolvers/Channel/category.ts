import mongoose, { Error, MongooseError } from "mongoose";
import { IResolvers } from "@graphql-tools/utils";
import { AuthenticationError, UserInputError } from "apollo-server";

import ChannelModel from "../../../models/Channel/channel";
import CategoryModel from "../../../models/Channel/category";
import CategoryPermissionModel from "../../../models/Channel/category_permission";
import { publishEvent, ServerEvents } from "../../pubsub/pubsub";

const POSITION_CONST = 1 << 20; // This is the constant used to calculate the position of the category
const POSITION_GAP = 10; // This is the minimum gap between the position of the categories

const createCategoryTransaction = async (server_id, input) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const opts = { session, new: true };

  try {
    // Get the last position of the categories
    let position = 0;
    const categories = await CategoryModel.find({ server_id }).session(session);
    position = categories.length * POSITION_CONST;

    // Create the category
    const category = await CategoryModel.create(
      [
        {
          server_id,
          name: input.name,
          position,
          private: {
            is_private: input.is_private,
          },
        },
      ],
      opts
    );

    // Create the category permissions for @everyone
    const category_permission = await CategoryPermissionModel.create(
      [
        {
          category_id: category[0]._id,
          server_role_id: null,
          is_user: false,
        },
      ],
      opts
    );

    await session.commitTransaction();
    session.endSession();

    return category[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(error);
  }
};

const deleteCategoryTransaction = async (category_id) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const opts = { session, new: true };

  try {
    const category = await CategoryModel.findById(category_id).session(session);

    if (!category) {
      throw new UserInputError("Category not found");
    }

    // Delete the category
    await CategoryModel.findByIdAndDelete(category_id).session(session);

    // Delete the category permissions
    await CategoryPermissionModel.deleteMany({ category_id }).session(session);

    // Set all the channels of the category to null
    await ChannelModel.updateMany({ category_id }, { category_id: null }, opts);

    await session.commitTransaction();
    session.endSession();

    return true;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(error);
  }
};

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
      const category = await createCategoryTransaction(server_id, input);

      // Publish the event
      publishEvent(ServerEvents.serverUpdated, {
        type: ServerEvents.categoryAdded,
        server_id: server_id,
        data: {
          ...category.toObject(),
        },
      });

      return category;
    },
    updateCategory: async (_, { category_id, input }) => {
      try {
        const category = await CategoryModel.findByIdAndUpdate(
          category_id,
          input,
          { new: true }
        );

        if (!category) {
          throw new UserInputError("Category not found");
        }

        // Publish the event
        publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.categoryUpdated,
          server_id: category.server_id,
          data: {
            ...category.toObject(),
          },
        });

        return category;
      } catch (error) {
        throw new Error(error);
      }
    },
    deleteCategory: async (_, { category_id }) => {
      try {
        const result = await deleteCategoryTransaction(category_id);

        // Publish the event
        publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.categoryDeleted,
          server_id: category_id,
        });

        return true;
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

        const categories = await CategoryModel.find({
          server_id: category.server_id,
        });
        categories.filter((c) => c._id !== category_id);

        // Normalize the new position
        new_position = Math.max(0, Math.min(new_position, categories.length));

        // Find the previous and next category
        const previous_category = categories[new_position - 1];
        const next_category = categories[new_position];

        // Check if the channel is already in the correct position
        if (
          (previous_category &&
            previous_category._id.toString() === category_id) ||
          (next_category && next_category._id.toString() === category_id)
        ) {
          return category;
        }

        // Calculate the new position
        let position = 0;
        if (previous_category && next_category) {
          position = (previous_category.position + next_category.position) / 2;

          // Normalize the position if the gap is too small
          if (
            next_category.position - previous_category.position <
            POSITION_GAP
          ) {
            categories.forEach(async (category, index) => {
              category.position = index * POSITION_CONST;
              await category.save();
            });
          }
        } else if (previous_category) {
          position = previous_category.position + POSITION_CONST;
        } else if (next_category) {
          position = next_category.position - POSITION_CONST;
        }

        // Update the position of the category
        category.position = position;
        await category.save();

        // Publish the event
        publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.categoryUpdated,
          server_id: category.server_id,
          data: {
            ...categories,
            ...category.toObject(),
          },
        });

        return category;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};

export default resolvers;
