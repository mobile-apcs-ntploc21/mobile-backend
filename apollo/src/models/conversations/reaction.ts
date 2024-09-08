import mongoose, { model, Schema } from "mongoose";
import validator from "validator";
import ModelNames from "./../modelNames";

interface IReaction {
  message_id: Schema.Types.ObjectId;
  sender_id: Schema.Types.ObjectId;
  emoji_id: Schema.Types.ObjectId;
  last_modified: Date;
}

const reactionSchema = new Schema<IReaction>(
  {
    message_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.Message,
      required: [true, "Message ID is required!"],
    },
    sender_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.User,
      required: [true, "Sender ID is required!"],
    },
    emoji_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.Server_Emoji,
      required: [true, "Emoji ID is required!"],
    },
    last_modified: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const ReactionModel = mongoose.model<IReaction>(
  ModelNames.Reaction,
  reactionSchema
);
export default ReactionModel;
