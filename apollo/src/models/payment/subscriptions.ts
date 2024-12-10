import mongoose, { model, Schema } from "mongoose";
import validator from "validator";
import ModelNames from "@models/modelNames";

interface ISubscriptions {
  user_id: Schema.Types.ObjectId;
  package_id: Schema.Types.ObjectId;

  is_active: boolean;
  startDate: Date;
  endDate: Date;
}

const subscriptionSchema = new Schema<ISubscriptions>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.User,
      required: [true, "User ID is required!"],
    },
    package_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.Packages,
      required: [true, "Plan ID is required!"],
    },
    is_active: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required!"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required!"],
    },
  },
  { timestamps: true }
);

const Subscriptions = model<ISubscriptions>(
  ModelNames.Subscriptions,
  subscriptionSchema
);

export default Subscriptions;
