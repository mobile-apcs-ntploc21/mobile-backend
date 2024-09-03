import mongoose, { model, Schema } from "mongoose";

/// Channel Permission
interface IChannelPermission {
  channel_id: { type: Schema.Types.ObjectId };
  server_role_id: { type: Schema.Types.ObjectId };
  user_id: { type: Schema.Types.ObjectId };

  // Permissions
  is_user: boolean;
  allow: string; // Bitwise
  deny: string; // Bitwise
}

const channelPermissionSchema = new Schema<IChannelPermission>(
  {
    channel_id: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      required: [true, "Channel ID is required!"],
    },
    server_role_id: {
      type: Schema.Types.ObjectId,
      ref: "ServerRole",
      required: false,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    is_user: {
      type: Boolean,
      default: false,
    },
    allow: {
      type: String,
      default: "",
    },
    deny: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const ChannelPermission = mongoose.model<IChannelPermission>(
  "ChannelPermission",
  channelPermissionSchema
);

export default ChannelPermission;
