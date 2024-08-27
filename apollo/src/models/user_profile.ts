import mongoose, { model, Schema } from "mongoose";
import validator from "validator";
import ModelNames from "./modelNames";

interface IUserProfile {
  user_id: mongoose.Types.ObjectId;
  server_id?: mongoose.Types.ObjectId; // Optional, for users who are not use custom server profile
  display_name?: string; // Optional, if not provided, use the user's username
  username: string;
  about_me: string;
  avatar_url?: string; // Optional, if not provided, use the default avatar
  banner_url?: string; // Optional, if not provided, use the default banner
}

const userProfileSchema = new Schema<IUserProfile>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.User,
      required: [true, "User ID is required"],
    },
    server_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.Server,
      required: false,
      default: null,
    },
    display_name: {
      type: String,
      required: false,
      validate: {
        validator: (value: string) => {
          return validator.isLength(value, { min: 1, max: 50 });
        },
        message: "Display name cannot exceed 50 characters",
      },
    },
    username: {
      type: String,
      ref: "User",
      required: true,
    },
    about_me: {
      type: String,
      default: "Hello, I'm new here!",
      required: false,
      validate: {
        validator: (value: string) => {
          return validator.isLength(value, { min: 0, max: 190 });
        },
        message: "About me cannot exceed 190 characters.",
      },
    },
    avatar_url: {
      type: String,
      required: false,
    },
    banner_url: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

// Create a unique index for user_id and server_id
userProfileSchema.index({ user_id: 1, server_id: 1 }, { unique: true });

const UserProfileModel = model<IUserProfile>(
  ModelNames.UserProfile,
  userProfileSchema
);
export default UserProfileModel;
