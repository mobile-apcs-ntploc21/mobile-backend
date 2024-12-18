import mongoose, { Error } from "mongoose";
import { IResolvers } from "@graphql-tools/utils";
import { UserInputError, ValidationError } from "apollo-server";
import fs from "fs";

import UserModel from "@/models/user";
import PaymentLogModel from "@/models/payment/paymentlog";
import OrderModel from "@/models/payment/orders";

const getPaymentLog = async (log_id: string) => {
  try {
    const log = await PaymentLogModel.findById(log_id);
    return log;
  } catch (error) {
    throw error;
  }
};

const getPaymentLogs = async (user_id: string) => {
  if (!mongoose.Types.ObjectId.isValid(user_id)) {
    throw new UserInputError("Invalid user id!");
  }

  try {
    const logs = await PaymentLogModel.find({ user_id });
    return logs;
  } catch (error) {
    throw error;
  }
};

const createPaymentLog = async (
  user_id: string,
  order_id: string,
  request: string,
  response: string,
  transaction_id: string,
  log_type: string,
  data: any
) => {
  const logTypes = ["authorize", "IPN", "redirect"];

  const user = await UserModel.findById(user_id).lean();

  if (!user) {
    throw new UserInputError("Invalid user id!");
  }

  const order = await OrderModel.findById(order_id).lean();

  if (!order) {
    throw new UserInputError("Invalid order id!");
  }

  if (!logTypes.includes(log_type)) {
    throw new UserInputError("Invalid log type!");
  }

  // Checking for duplicate logs
  const paymentLog = await PaymentLogModel.findOne({
    transaction_id,
    log_type,
  });

  // If log already exists, return it
  if (paymentLog) {
    return paymentLog;
  }

  try {
    const log = new PaymentLogModel({
      user_id,
      order_id,
      request,
      response,
      transaction_id,
      log_type,
      data,
    });

    await log.save();
    return log;
  } catch (error) {
    throw error;
  }
};

// ====== Query Resolvers ======

const resolversAPI: IResolvers = {
  Query: {
    paymentLog: async (_, { log_id }) => getPaymentLog(log_id),
    paymentLogs: async (_, { user_id }) => getPaymentLogs(user_id),
  },
  Mutation: {
    createPaymentLog: async (
      _,
      { user_id, order_id, request, response, transaction_id, log_type, data }
    ) =>
      createPaymentLog(
        user_id,
        order_id,
        request,
        response,
        transaction_id,
        log_type,
        data
      ),
  },
};

export default { API: resolversAPI };
