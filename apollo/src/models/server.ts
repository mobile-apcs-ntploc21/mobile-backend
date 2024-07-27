import mongoose, { model, Schema } from "mongoose";
import validator from "validator";

interface IServer {
  owner: { type: Schema.Types.ObjectId };
  name: string;
  photo_url: string;
  banner_url: string;
  invite_code: {
    url: string;
    expiredAt: Date;
    maxUses: number;
    currentUses: number;
  }[];
  totalMembers: number | undefined;
  totalEmojis: number | undefined;
}

const serverSchema = new Schema<IServer>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner ID is required!"],
    },
    name: {
      type: String,
      minlength: [1, "Server name must be at least 1 characters long!"],
      maxlength: [100, "Server name must be at most 100 characters long!"],
      required: [true, "Server name is required!"],
    },
    photo_url: {
      type: String,
      default: "",
    },
    banner_url: {
      type: String,
      default: "",
    },
    invite_code: [
      {
        url: {
          type: String,
          required: [true, "Invite code URL is required!"],
          unique: true,
          sparse: true,
        },
        expiredAt: {
          type: Date,
          required: false, // If not provided, it means the invite code never expires
          default: null,
        },
        maxUses: {
          type: Number,
          required: [true, "Invite code maxUses is required!"],
          default: 0, // 0 means unlimited uses
        },
        currentUses: {
          type: Number,
          required: [true, "Invite code currentUses is required!"],
          default: 0,
        },
        default: [],
      },
    ],
    totalMembers: {
      type: Number,
      default: 0,
    },
    totalEmojis: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const serverModel = mongoose.model<IServer>("Server", serverSchema);

export default serverModel;
