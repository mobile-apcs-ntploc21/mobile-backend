import mongoose, { Schema } from "mongoose";
import ModelNames from "@/models/modelNames";

interface IDirectMessage {
  _id: {
    user_first_id: Schema.Types.ObjectId;
    user_second_id: Schema.Types.ObjectId;
  };
  conversation_id: Schema.Types.ObjectId;
  latest_message_id: Schema.Types.ObjectId | null;
  has_new_message: boolean;
  number_of_unread_mentions: number;
}

const directMessageSchema = new Schema<IDirectMessage>(
  {
    _id: {
      user_first_id: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.User,
        required: [true, "User ID for user 1 is required!"],
      },
      user_second_id: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.User,
        required: [true, "User ID for user 2 is required!"],
      },
    },
    conversation_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.Conversation,
      required: [true, "Conversation ID is required!"],
    },
    latest_message_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.Message,
      default: null,
    },
    has_new_message: {
      type: Boolean,
      default: false,
    },
    number_of_unread_mentions: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, _id: false }
);

directMessageSchema.index(
  { conversation_id: 1, user_first_id: 1, user_second_id: 1 },
  { unique: true }
);

const DirectMessageModel = mongoose.model<IDirectMessage>(
  ModelNames.DirectMessage,
  directMessageSchema
);
export default DirectMessageModel;
