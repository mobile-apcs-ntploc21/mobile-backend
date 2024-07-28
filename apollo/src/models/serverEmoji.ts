import server from "@/graphql/typedefs/server";
import mongoose, { model, Schema } from "mongoose";
import validator from "validator";

interface IServerEmoji {
  server_id: Schema.Types.ObjectId;
  name: string;
  image_url: string;
  uploader_id: Schema.Types.ObjectId;
  is_deleted: boolean;
}

const serverEmojiSchema = new Schema<IServerEmoji>(
  {
    server_id: {
      type: Schema.Types.ObjectId,
      ref: "Server",
      required: [true, "Server ID is required!"],
    },
    name: {
      type: String,
      minlength: [1, "Emoji name must be at least 1 characters long!"],
      maxlength: [100, "Emoji name must be at most 100 characters long!"],
      required: [true, "Emoji name is required!"],
    },
    image_url: {
      type: String,
      required: [true, "Emoji image URL is required!"],
    },
    uploader_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Uploader ID is required!"],
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound unique index for server_id and name
serverEmojiSchema.index({ server_id: 1, name: 1 }, { unique: true });

// Validate image URL
serverEmojiSchema.pre("validate", function (next) {
  if (!validator.isURL(this.image_url)) {
    next(new Error("Invalid image URL!"));
  }
  next();
});

const ServerEmoji = model<IServerEmoji>("ServerEmoji", serverEmojiSchema);

export default ServerEmoji;
