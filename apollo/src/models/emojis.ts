import mongoose, { model, Schema } from "mongoose";
import validator from "validator";
import ModelNames from "./modelNames";

interface IEmoji {
  name: string;
  image_url: string;

  type: string;

  // For unicode emojis
  unicode: string;

  // For server emojis
  is_deleted: boolean;
  server_id: Schema.Types.ObjectId;
  uploader_id: Schema.Types.ObjectId;
}

const emojiSchema = new Schema<IEmoji>(
  {
    name: {
      type: String,
      minlength: [1, "Emoji name must be at least 1 characters long!"],
      maxlength: [100, "Emoji name must be at most 100 characters long!"],
      required: [true, "Emoji name is required!"],
    },
    image_url: {
      type: String,
      validate: [validator.isURL, "Invalid image URL!"],
    },
    type: {
      type: String,
      enum: ["unicode", "server"],
      required: [true, "Emoji type is required!"],
    },
    unicode: {
      type: String,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    server_id: {
      type: Schema.Types.ObjectId,
      ref: "Server",
    },
    uploader_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Compound unique index for server_id and name
emojiSchema.index({ server_id: 1, name: 1 }, { unique: true });

const Emoji = model<IEmoji>(ModelNames.Emojis, emojiSchema);

export default Emoji;
