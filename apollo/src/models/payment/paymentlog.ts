import mongoose, { model, Schema } from "mongoose";
import validator from "validator";
import ModelNames from "@models/modelNames";

interface IPaymentLog {
  user_id: Schema.Types.ObjectId;
  order_id: Schema.Types.ObjectId;

  request: string;
  response: string;
  transaction_id: string;

  data: any;
  log_type: string;
}

const paymentLogSchema = new Schema<IPaymentLog>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.User,
      required: [true, "User ID is required!"],
    },
    order_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.Orders,
      required: [true, "Order ID is required!"],
    },
    request: {
      type: String,
      required: [true, "Request is required!"],
    },
    response: {
      type: String,
      required: [true, "Response is required!"],
    },
    transaction_id: {
      type: String,
      required: [true, "Transaction ID is required!"],
    },
    data: {
      type: Schema.Types.Mixed,
    },
    log_type: {
      type: String,
      enum: {
        values: ["authorize", "ipn", "redirect"],
        message: "{VALUE} is not supported!",
      },
      required: [true, "Log type is required!"],
    },
  },
  { timestamps: true }
);

const PaymentLog = model<IPaymentLog>(ModelNames.PaymentLog, paymentLogSchema);

export default PaymentLog;
