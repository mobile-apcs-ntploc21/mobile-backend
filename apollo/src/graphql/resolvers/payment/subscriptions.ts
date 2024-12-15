import mongoose, { Error, ObjectId } from "mongoose";
import { IResolvers } from "@graphql-tools/utils";
import { UserInputError, ValidationError } from "apollo-server";

import UserModel from "@/models/user";
import OrderModel from "@/models/payment/orders";
import PackageModel from "@/models/payment/packages";
import UserSubscriptionModel from "@/models/payment/subscriptions";

const getUserSubscription = async (user_id: string) => {
  const user = await UserModel.findById(user_id).lean();

  if (!user) {
    throw new UserInputError(
      "Invalid user id or a user not found on the database!"
    );
  }

  try {
    const userSubscription = await UserSubscriptionModel.findOne({ user_id });

    if (!userSubscription) {
      throw new UserInputError(
        "User subscription not found! Please run syncUserSubscription if the server haven't sync yet."
      );
    }

    return userSubscription;
  } catch (error) {
    throw error;
  }
};

const updateUserSubscription = async (
  id: string,
  package_id: string,
  is_active: boolean,
  startDate: string,
  endDate: string
) => {
  try {
    const userSubscription = await UserSubscriptionModel.findByIdAndUpdate(
      id,
      { is_active, package_id, startDate, endDate },
      { new: true }
    );

    if (!userSubscription) {
      throw new UserInputError("User subscription not found!");
    }

    return userSubscription;
  } catch (error) {
    throw error;
  }
};

const updateUserPackageSubscription = async (
  user_id: string,
  package_id: string
) => {
  const userSubscription = await UserSubscriptionModel.findOne({ user_id });

  if (!userSubscription) {
    throw new UserInputError("User subscription not found!");
  }

  try {
    const _package = await PackageModel.findById(package_id).lean();

    if (!_package) {
      throw new UserInputError("Invalid package id!");
    }

    // Set active to false if package_id is not provided
    if (!package_id || package_id === undefined) {
      const updatedUserSubscription =
        await UserSubscriptionModel.findByIdAndUpdate(
          userSubscription._id,
          { is_active: false },
          { new: true }
        );

      if (!updatedUserSubscription) {
        throw new UserInputError("Failed to update user subscription!");
      }

      return updatedUserSubscription;
    }

    const startDate = new Date();
    const endDate = new Date();

    // Duration is in day: 30 = 30 days
    endDate.setDate(startDate.getDate() + _package.duration);

    const updatedUserSubscription =
      await UserSubscriptionModel.findByIdAndUpdate(
        userSubscription._id,
        {
          package_id,
          startDate,
          endDate,
          is_active: true,
        },
        { new: true }
      );

    if (!updatedUserSubscription) {
      throw new UserInputError("Failed to update user subscription!");
    }

    return updatedUserSubscription;
  } catch (error) {
    throw error;
  }
};

const syncUserSubscription = async (confirm: boolean) => {
  if (!confirm) {
    throw new UserInputError("Please confirm to sync user subscription!");
  }

  try {
    const users = await UserModel.find().lean();

    for (const user of users) {
      const userSubscription = await UserSubscriptionModel.findOne({
        user_id: user._id,
      });

      if (!userSubscription) {
        const newUserSubscription = new UserSubscriptionModel({
          user_id: user._id,
          package_id: null,
          is_active: false,
          startDate: null,
          endDate: null,
        });

        await newUserSubscription.save();
      }
    }

    return true;
  } catch (error) {
    throw error;
  }
};

const resolvers: IResolvers = {
  Query: {
    userSubscription: async (_, { user_id }) => {
      return await getUserSubscription(user_id);
    },
  },
  Mutation: {
    updateUserSubscription: async (
      _,
      { id, package_id, is_active, startDate, endDate }
    ) => {
      return await updateUserSubscription(
        id,
        package_id,
        is_active,
        startDate,
        endDate
      );
    },
    updateUserPackageSubscription: async (_, { user_id, package_id }) => {
      return await updateUserPackageSubscription(user_id, package_id);
    },
    syncUserSubscription: async (_, { confirm }) => {
      return await syncUserSubscription(confirm);
    },
  },
};

export default { API: resolvers };
