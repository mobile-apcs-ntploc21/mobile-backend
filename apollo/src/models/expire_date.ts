import mongoose, { model, Schema } from "mongoose";
import validator from "validator";
import ModelNames from "./modelNames";
import expire_date from "@/graphql/typedefs/expire_date";

interface IExpireDate {
  object_type: string;
  object: {
    object_id: Schema.Types.ObjectId;
    expire_date: Date;
  };
}

export enum ExpirableType {
  STATUS_TEXT = "status_text",
}

const expireDateSchema = new Schema<IExpireDate>(
  {
    object_type: {
      type: String,
      required: [true, "Object type is required!"],
      enum: Object.values(ExpirableType),
    },
    object: {
      object_id: {
        type: Schema.Types.ObjectId,
        required: [true, "Object ID is required!"],
      },
      expire_date: Date,
    },
  },
  { timestamps: true }
);

const ExpireDateModel = model<IExpireDate>(
  ModelNames.ExpireDate,
  expireDateSchema
);

export default ExpireDateModel;
