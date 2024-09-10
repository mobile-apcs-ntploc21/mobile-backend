import mongoose, { model, Schema } from "mongoose";
import ModelNames from "./../../modelNames";

interface IChannel {
  server_id: Schema.Types.ObjectId;
  conversation_id: Schema.Types.ObjectId;
  category_id: Schema.Types.ObjectId;

  // Overview
  name: string;
  description: string;
  last_message_id: { type: Schema.Types.ObjectId };
  position: number;

  // Settings
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
    position: {
      type: Number,
      required: [true, "Channel position is required!"],
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

channelSchema.index({ server_id: 1 }); // Find all channels in a server
channelSchema.index({ category_id: 1 }); // Find all channels in a category

const Channel = mongoose.model<IChannel>(ModelNames.Channel, channelSchema);

export default Channel;
