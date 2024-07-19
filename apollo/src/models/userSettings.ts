import mongoose, { model, Schema } from "mongoose";
import validator from "validator";

export interface IUserSettings {
  userId: { type: Schema.Types.ObjectId };
  settings: string;
}

const userSettingsSchema = new Schema<IUserSettings>(
  {
    userId: {
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

const UserSettingsModel = model<IUserSettings>("settings", userSettingsSchema);
export default UserSettingsModel;
