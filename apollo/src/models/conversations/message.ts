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
    },
    replied_message_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.Message,
    },
    forwarded_message_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.Message,
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

const MessageModel = mongoose.model<IMessage>(
  ModelNames.Message,
  messageSchema
);
export default MessageModel;
