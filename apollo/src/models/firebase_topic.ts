import mongoose, { Schema } from "mongoose";
import ModelNames from "./modelNames";

interface IFirebaseTopic {
  topic: string;
  user_ids: Schema.Types.ObjectId[];
}

const firebaseTopicSchema = new Schema<IFirebaseTopic>(
  {
    topic: {
      type: String,
      required: true,
      unique: true,
    },
    user_ids: {
      type: [Schema.Types.ObjectId],
      required: true,
      default: [],
    },
  },
  { timestamps: true }
);

firebaseTopicSchema.index({ topic: 1 });

const FirebaseTopic = mongoose.model<IFirebaseTopic>(
  ModelNames.FirebaseTopic,
  firebaseTopicSchema
);
export default FirebaseTopic;
