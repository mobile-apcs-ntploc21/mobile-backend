import mongoose, { model, Schema } from "mongoose";
import validator from "validator";
import ModelNames from "./../modelNames";

interface IMention {
  conversation_id: Schema.Types.ObjectId;
  message_id: Schema.Types.ObjectId;
  mention_user_id: Schema.Types.ObjectId;
  mention_role_id: Schema.Types.ObjectId;
  mention_channel_id: Schema.Types.ObjectId;
  last_modified: Date;
}

const mentionSchema = new Schema<IMention>(
  {
    conversation_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.Conversation,
      required: [true, "Conversation ID is required!"],
    },
    message_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.Message,
      required: [true, "Mentioned message ID is required!"],
    },
    mention_user_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.User,
      // required: [true, "User ID is required!"],
    },
    mention_role_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.ServerRole,
      // required: [true, "User ID is required!"],
    },
    mention_channel_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.Channel,
      // required: [true, "User ID is required!"],
    },
    last_modified: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, _id: true }
);

const MentionModel = mongoose.model<IMention>(
  ModelNames.Mention,
  mentionSchema
);
export default MentionModel;

// mention_user_id is required if mention_role_id and mention_channel_id is not provided and vice versa
// mention_role_id is required if mention_user_id and mention_channel_id is not provided and vice versa
// mention_channel_id is required if mention_user_id and mention_role_id is not provided and vice versa
// only one mention is allowed, either mention_user_id or mention_role_id or mention_channel_id
mentionSchema.pre("save", function (next) {
  let num_mentions =
    (this.mention_user_id ? 1 : 0) +
    (this.mention_role_id ? 1 : 0) +
    (this.mention_channel_id ? 1 : 0);
  if (num_mentions === 0) {
    next(
      new Error(
        "mention_user_id or mention_role_id or mention_channel_id is required!"
      )
    );
  }
  if (num_mentions > 1) {
    next(
      new Error(
        "only one mention is allowed, either mention_user_id or mention_role_id or mention_channel_id!"
      )
    );
  }
  next();
});
