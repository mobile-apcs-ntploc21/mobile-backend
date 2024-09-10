import mongoose, { model, Schema } from "mongoose";
import validator from "validator";
import ModelNames from "./../modelNames";

interface IMessage {
  conversation_id: Schema.Types.ObjectId;
  sender_id: Schema.Types.ObjectId;
  content: string;
  replied_message_id: Schema.Types.ObjectId;
  forwarded_message_id: Schema.Types.ObjectId;
  is_deleted: boolean;
  is_pinned: boolean;
  last_modified: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversation_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.Conversation,
      required: [true, "Conversation ID is required!"],
    },
    sender_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.User,
      required: [true, "Sender ID is required!"],
    },
    content: {
      type: String,
      required: [true, "Content is required!"], // Ensure content is always provided.
    },
    replied_message_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.Message,
      default: null,
    },
    forwarded_message_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.Message,
      default: null,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    is_pinned: {
      type: Boolean,
      default: false,
    },
    last_modified: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create indexes for the message schema
messageSchema.index({ content: "text" });
// Querying messages by conversation_id and sender_id
messageSchema.index({ conversation_id: 1 });
messageSchema.index({ sender_id: 1 });

// Create a Message model from the message schema
const MessageModel = mongoose.model<IMessage>(
  ModelNames.Message,
  messageSchema
);
export default MessageModel;
