import mongoose, { model, Schema } from "mongoose";
import validator from "validator";
import ModelNames from "./../modelNames";

interface ILastRead {
  _id: {
    conversation_id: Schema.Types.ObjectId;
    user_id: Schema.Types.ObjectId;
  };
  last_message_read_id: Schema.Types.ObjectId;
  last_modified: Date;
  updatedAt: Date;
}

const lastReadSchema = new Schema<ILastRead>(
  {
    _id: {
      conversation_id: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.Conversation,
        required: [true, "Conversation ID is required!"],
      },
      user_id: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.User,
        required: [true, "User ID is required!"],
      },
    },
    last_message_read_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.Message,
      required: [true, "Last message read ID is required!"],
    },
    last_modified: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, _id: false }
);

const LastReadModel = mongoose.model<ILastRead>(
  ModelNames.LastRead,
  lastReadSchema
);
export default LastReadModel;
