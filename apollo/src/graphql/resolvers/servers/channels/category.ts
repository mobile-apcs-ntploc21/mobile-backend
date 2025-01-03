import mongoose, { Error } from "mongoose";
import { IResolvers } from "@graphql-tools/utils";
import { UserInputError } from "apollo-server";

import ChannelModel from "@/models/servers/channels/channel";
import CategoryModel from "@/models/servers/channels/category";
import { publishEvent, ServerEvents } from "@/graphql/pubsub/pubsub";
import ServerRoleModel from "@/models/servers/server_role";
import CategoryRolePermission from "@models/servers/channels/category_role_permission";
import { defaultCategoryRole } from "@resolvers/servers/channels/category_role_permission";
import CategoryUserPermission from "@models/servers/channels/category_user_permission";

const POSITION_CONST = 1 << 20; // This is the constant used to calculate the position of the category
const POSITION_GAP = 10; // This is the minimum gap between the position of the categories

const createCategoryTransaction = async (server_id: any, input: any) => {
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
        },
      ],
      opts
    );

    // find the default server role and create a category permission for it
    const default_server_role = await ServerRoleModel.findOne({
      server_id,
      default: true,
    });

    if (!default_server_role) {
      throw new Error("Default server role not found");
    }

    await CategoryRolePermission.create(
      [
        {
          _id: {
            server_role_id: default_server_role._id,
            category_id: category[0]._id,
          },
          permissions: defaultCategoryRole,
        },
      ],
      opts
    );

    await session.commitTransaction();
    session.endSession();

    return category[0];
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(error);
  }
};

const deleteCategoryTransaction = async (category_id: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const opts = { session, new: true };

  try {
    if (category_id === null) {
      throw new UserInputError("You cannot delete the default category");
    }

    const category = await CategoryModel.findById(category_id).session(session);

    if (!category) {
      throw new UserInputError("Category not found");
    }

    // Delete the category
    await CategoryModel.findByIdAndDelete(category_id).session(session);

    // Delete the category permissions
    await CategoryRolePermission.deleteMany({
      "_id.category_id": category_id,
    }).session(session);
    await CategoryUserPermission.deleteMany({
      "_id.category_id": category_id,
    }).session(session);

    // Set all the channels of the category to null
    await ChannelModel.updateMany({ category_id }, { category_id: null }, opts);
    // Fix the position of the channels in the default category
    const channels = await ChannelModel.find({
      server_id: category.server_id,
      category_id: null,
      is_deleted: false,
    }).session(session);

    for (let i = 0; i < channels.length; i++) {
      channels[i].position = i * POSITION_CONST;
      await channels[i].save({ session: session });
    }

    await session.commitTransaction();
    session.endSession();

    return category;
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(error);
  }
};

const moveCategoryTransaction = async (
  server_id: any,
  category_id: any,
  new_position: any
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const opts = { session, new: true };

  try {
    const category = await CategoryModel.findById(category_id).session(session);
    if (!category || String(category.server_id) !== server_id) {
      throw new UserInputError("Category not found in the server");
    }

    // Assign the new position
    category.position = new_position * POSITION_CONST;
    await category.save(opts);
    await session.commitTransaction();
    session.endSession();
  } catch (error: any) {
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
      } catch (error: any) {
        throw new Error(error);
      }
    },
    getCategories: async (_, { server_id }) => {
      try {
        const categories = await CategoryModel.find({ server_id });
        return categories;
      } catch (error: any) {
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
      } catch (error: any) {
        throw new Error(error);
      }
    },
    deleteCategory: async (_, { category_id }) => {
      try {
        const result = await deleteCategoryTransaction(category_id);

        // Publish the event
        publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.categoryDeleted,
          server_id: result.server_id,
          data: {
            category_id: result._id,
          },
        });

        return true;
      } catch (error: any) {
        throw new Error(error);
      }
    },

    moveCategory: async (_, { category_id, new_position }) => {
      try {
        const category = await CategoryModel.findById(category_id);
        if (!category) {
          throw new UserInputError("Category not found");
        }

        let categories = await CategoryModel.find({
          server_id: category.server_id,
        });
        categories = categories.filter((c) => c._id !== category_id);

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
      } catch (error: any) {
        throw new Error(error);
      }
    },

    /**
     * Move all the categories to the new position
     * @param server_id: The server ID
     * @param input.category_id: The category ID
     * @param input.position: The new position
     */
    moveAllCategory: async (_, { server_id, input }) => {
      // Count the number of categories
      const categories = await CategoryModel.find({ server_id });
      if (categories.length !== input.length) {
        throw new UserInputError(
          "Please provide all the categories in the server. There are missing or extra categories."
        );
      }

      for (let i = 0; i < input.length; i++) {
        await moveCategoryTransaction(server_id, input[i].category_id, i);
      }

      const updated_categories = await CategoryModel.find({ server_id });

      // Publish the event
      publishEvent(ServerEvents.serverUpdated, {
        type: ServerEvents.categoryUpdated,
        server_id: server_id,
        data: {
          ...updated_categories,
        },
      });

      return updated_categories;
    },
  },
};

export default resolvers;
