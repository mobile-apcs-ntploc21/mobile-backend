import mongoose, { model, Schema } from "mongoose";
import validator from "validator";
import ModelNames from "./../modelNames";

interface IDirectMessage {
  _id: { user_first_id: Schema.Types.ObjectId; user_second_id: Schema.Types.ObjectId };
  conversation_id: Schema.Types.ObjectId;
  last_modified: Date;
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
    last_modified: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, _id: false }
);

const DirectMessageModel = mongoose.model<IDirectMessage>(
  ModelNames.DirectMessage,
  directMessageSchema
);
export default DirectMessageModel;
