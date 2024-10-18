import { model, Schema } from "mongoose";
import ModelNames from "./../../modelNames";

interface IChannelUserPermission {
  _id: { user_id: Schema.Types.ObjectId; channel_id: Schema.Types.ObjectId };
  permissions: string;
  last_modified: Date;
}

const schema = new Schema<IChannelUserPermission>(
  {
    _id: {
      user_id: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.User,
        required: [true, "User ID is required!"],
      },
      channel_id: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.Channel,
        required: [true, "Channel ID is required!"],
      },
    },
    permissions: {
      type: String,
      default: "",
    },
    last_modified: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const ChannelUserPermission = model<IChannelUserPermission>(
  ModelNames.ChannelUserPermission,
  schema
);
export default ChannelUserPermission;
