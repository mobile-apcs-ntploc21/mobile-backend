import mongoose, { Model, model, Schema } from "mongoose";
import ModelNames from "../modelNames";

interface IServerBan {
  _id: {
    server_id: Schema.Types.ObjectId;
    user_id: Schema.Types.ObjectId;
  };
}

const serverBanSchema = new Schema<IServerBan>(
  {
    _id: {
      server_id: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.Server,
        required: [true, "Server ID is required!"],
      },
      user_id: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.User,
        required: [true, "User ID is required!"],
      },
    },
  },
  { timestamps: true }
);

serverBanSchema.index({ server_id: 1 }); // Find all banned users in a server
serverBanSchema.index({ user_id: 1 }); // Check if a user is banned from a server

const ServerBan = mongoose.model(ModelNames.Server_Ban, serverBanSchema);

export default ServerBan;
