import mongoose, { model, Schema } from "mongoose";
import validator from "validator";
import ModelNames from "@models/modelNames";

interface IOrders {
  user_id: Schema.Types.ObjectId;
  package_id: Schema.Types.ObjectId;

  amount: number; // In VND
  status: string;
  transaction_id: string;
}

const orderSchema = new Schema<IOrders>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.User,
      required: [true, "User ID is required!"],
    },
    package_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.Packages,
      required: [true, "Package ID is required!"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required!"],
      validate: {
        validator: (value: number) => value > 0,
        message: "Amount must be greater than 0!",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["Pending", "Paid", "Failed", "Chargeback", "Refunded"],
        message: "{VALUE} is not supported!",
      },
      default: "Pending",
      required: [true, "Status is required!"],
    },
    transaction_id: {
      type: String,
      required: [true, "Transaction ID is required!"],
    },
  },
  { timestamps: true }
);

const Orders = model<IOrders>(ModelNames.Orders, orderSchema);

export default Orders;
