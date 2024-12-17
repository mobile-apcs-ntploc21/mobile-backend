import { model, Schema } from "mongoose";
import ModelNames from "./modelNames";

interface IDevice {
  user_id: Schema.Types.ObjectId;
  device_tokens: string[];
}

const deviceSchema = new Schema<IDevice>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.User,
      required: [true, "User ID is required!"],
      unique: true,
    },
    device_tokens: {
      type: [String],
      default: [],
      validate: {
        validator: function (value: string[]) {
          return Array.isArray(value) && new Set(value).size === value.length;
        },
        message: "Device tokens must be unique",
      },
    },
  },
  { timestamps: false, _id: false }
);

deviceSchema.index({ user_id: 1 }, { unique: true });

const Device = model<IDevice>(ModelNames.Device, deviceSchema);

export default Device;
