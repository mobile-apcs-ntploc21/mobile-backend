import mongoose, { model, Schema } from "mongoose";
import validator from "validator";
import ModelNames from "./modelNames";

export interface IUserSettings {
  user_id: { type: Schema.Types.ObjectId };
  settings: string;
}

const userSettingsSchema = new Schema<IUserSettings>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required!"],
    },
    settings: {
      type: String,
      default: "",
      required: false,
    },
  },
  { timestamps: true, id: false }
);

const UserSettingsModel = model<IUserSettings>(
  ModelNames.UserSetting,
  userSettingsSchema
);
export default UserSettingsModel;
