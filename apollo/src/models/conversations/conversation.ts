import mongoose, { model, Schema } from "mongoose";
import validator from "validator";
import ModelNames from "./../modelNames";

interface IConversation {
  last_modified: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    last_modified: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const ConversationModel = mongoose.model<IConversation>(
  ModelNames.Conversation,
  conversationSchema
);
export default ConversationModel;
