import mongoose, { model, Schema } from "mongoose";
import validator from "validator";

interface IChannel {
  server_id: { type: Schema.Types.ObjectId };
  conversation_id: { type: Schema.Types.ObjectId };
  category_id: { type: Schema.Types.ObjectId };

  // Overview
  name: string;
  description: string;
  last_message_id: { type: Schema.Types.ObjectId };

  // Settings
  private: {
    is_private: boolean;
    role_id: [{ type: Schema.Types.ObjectId }];
    user_id: [{ type: Schema.Types.ObjectId }];
  };
  is_nsfw: boolean;
  is_archived: boolean;
  is_deleted: boolean;
}

const channelSchema = new Schema<IChannel>(
  {
    server_id: {
      type: Schema.Types.ObjectId,
      ref: "Server",
    },
    conversation_id: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    name: {
      type: String,
      minlength: [1, "Channel name must be at least 1 characters long!"],
      maxlength: [100, "Channel name must be at most 100 characters long!"],
      required: [true, "Channel name is required!"],
    },
    description: {
      type: String,
      default: "",
    },
    last_message_id: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      required: false,
    },
    private: {
      is_private: {
        type: Boolean,
        default: false,
      },
      role_id: [
        {
          type: Schema.Types.ObjectId,
          ref: "ServerRole",
          required: false,
        },
      ],
      user_id: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: false,
        },
      ],
    },
    is_nsfw: {
      type: Boolean,
      default: false,
    },
    is_archived: {
      type: Boolean,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Channel = model<IChannel>("Channel", channelSchema);

/// Channel Permission
interface IChannelPermission {
  channel_id: { type: Schema.Types.ObjectId };
  server_role_id: { type: Schema.Types.ObjectId };
  user_id: { type: Schema.Types.ObjectId };

  // Permissions
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

const ChannelPermission = model<IChannelPermission>(
  "ChannelPermission",
  channelPermissionSchema
);

export { Channel, ChannelPermission };
