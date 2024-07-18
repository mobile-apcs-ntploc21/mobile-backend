import mongoose, { model, Schema } from "mongoose";
import validator from "validator";

interface IUserProfile {
  user_id: mongoose.Types.ObjectId;
  server_id?: mongoose.Types.ObjectId; // Optional, for users who are not use custom server profile
  display_name?: string; // Optional, if not provided, use the user's username
  username: string;
  about_me: string;
  avatar_url?: string; // Optional, if not provided, use the default avatar
  banner_url?: string; // Optional, if not provided, use the default banner
  status: mongoose.Types.ObjectId;
}

const userProfileSchema = new Schema<IUserProfile>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    server_id: {
      type: Schema.Types.ObjectId,
      ref: "Server",
      required: false,
      default: null,
    },
    display_name: {
      type: String,
      required: false,
    },
    username: {
      type: String,
      ref: "User",
      required: true,
      unique: true,
    },
    about_me: {
      type: String,
      default: "Hello, I'm new here!",
      required: true,
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
    status: {
      type: Schema.Types.ObjectId,
      ref: "OnlineStatus",
      required: false,
    },
  },
  { timestamps: true }
);

const UserProfileModel = model<IUserProfile>("UserProfile", userProfileSchema);
export default UserProfileModel;
