import mongoose, { Error, ObjectId } from "mongoose";
import { IResolvers } from "@graphql-tools/utils";
import { UserInputError, ValidationError } from "apollo-server";

import UserModel from "@/models/user";
import OrderModel from "@/models/payment/orders";
import PackageModel from "@/models/payment/packages";

const getOrder = async (order_id: string) => {
  try {
    const order = await OrderModel.findById(order_id);

    if (!order) {
      throw new UserInputError("Invalid order id!");
    }

    return order;
  } catch (error) {
    throw error;
  }
};

const getOrders = async () => {
  try {
    const orders = await OrderModel.find();
    return orders;
  } catch (error) {
    throw error;
  }
};

const getOrdersByUser = async (user_id: string) => {
  if (!mongoose.Types.ObjectId.isValid(user_id)) {
    throw new UserInputError("Invalid user id!");
  }

  try {
    const orders = await OrderModel.find({ user_id });
    return orders;
  } catch (error) {
    throw error;
  }
};

const getOrderByTransaction = async (transaction_id: string) => {
  try {
    const order = await OrderModel.findOne({ transaction_id });

    if (!order) {
      throw new UserInputError("Invalid transaction id!");
    }

    return order;
  } catch (error) {
    throw error;
  }
};

const createOrder = async (
  user_id: string,
  package_id: string,
  amount: number,
  status: string,
  transaction_id: string
) => {
  const [user, _package] = await Promise.all([
    UserModel.findById(user_id).lean(),
    PackageModel.findById(package_id).lean(),
  ]);

  if (!user) {
    throw new UserInputError("Invalid user id!");
  }

  if (!_package) {
    throw new UserInputError("Invalid package id!");
  }

  if (amount < 0) {
    throw new UserInputError(
      "Invalid amount. The amount should be positive or 0!"
    );
  }

  const statuses = ["Pending", "Paid", "Failed", "Chargeback", "Refunded"];
  if (!statuses.includes(status)) {
    throw new UserInputError("Invalid status!");
  }

  try {
    const order = new OrderModel({
      user_id,
      package_id,
      amount,
      status,
      transaction_id,
    });

    await order.save();
    return order;
  } catch (error) {
    throw error;
  }
};

const updateOrder = async (
  id: string,
  amount: number,
  status: string,
  transaction_id: string
) => {
  if (amount < 0) {
    throw new UserInputError(
      "Invalid amount. The amount should be positive or 0!"
    );
  }

  const statuses = ["Pending", "Paid", "Failed", "Chargeback", "Refunded"];
  if (!statuses.includes(status)) {
    throw new UserInputError("Invalid status!");
  }

  try {
    const order = await OrderModel.findByIdAndUpdate(
      id,
      { amount, status, transaction_id },
      { new: true }
    );

    return order;
  } catch (error) {
    throw error;
  }
};

const updateOrderStatus = async (id: string, status: string) => {
  const statuses = ["Pending", "Paid", "Failed", "Chargeback", "Refunded"];
  if (!statuses.includes(status)) {
    throw new UserInputError("Invalid status!");
  }

  try {
    const order = await OrderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    return order;
  } catch (error) {
    throw error;
  }
};

const deleteOrder = async (id: string) => {
  try {
    const order = await OrderModel.findByIdAndDelete(id);

    if (!order) {
      throw new UserInputError("Invalid order id!");
    }

    return true;
  } catch (error) {
    throw error;
  }
};

// ====== Query Resolvers ======

const resolversAPI: IResolvers = {
  Query: {
    orders: async () => await getOrders(),
    order: async (_, { id }) => await getOrder(id),
    ordersByUser: async (_, { user_id }) => await getOrdersByUser(user_id),
    orderByTransaction: async (_, { transaction_id }) =>
      await getOrderByTransaction(transaction_id),
  },

  Mutation: {
    createOrder: async (_, args) =>
      await createOrder(
        args.user_id,
        args.package_id,
        args.amount,
        args.status,
        args.transaction_id
      ),
    updateOrder: async (_, args) =>
      await updateOrder(args.id, args.amount, args.status, args.transaction_id),
    updateOrderStatus: async (_, args) =>
      await updateOrderStatus(args.id, args.status),
    deleteOrder: async (_, { id }) => await deleteOrder(id),
  },
};

export default { API: resolversAPI };
