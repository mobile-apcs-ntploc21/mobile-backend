import mongoose, { model, Schema } from "mongoose";
import validator from "validator";

export interface IServer {
  owner: { type: Schema.Types.ObjectId };
  name: String,
  photo_url: String,
  background_url: String,
  invite_code: String,
  last_modified: Date,
  total_members: Number,
  total_emojis: Number,
}

const serverSchema = new Schema<IServer>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner's user ID is required!"],
    },
    name: {
      type: String,
      required: [true, "Server name is required!"],
    },
    photo_url: {
      type: String,
      default: "",
    },
    background_url: {
      type: String,
      default: "",
    },
    invite_code: {
      type: String,
      default: "",
    },
    last_modified: {
      type: Date,
      default: Date.now,
    },
    total_members: {
      type: Number,
      default: 0,
    },
    total_emojis: {
      type: Number,
      default: 0,
    },

  },
  { timestamps: true }
);

const ServerModel = model<IServer>("server", serverSchema);
export default ServerModel;