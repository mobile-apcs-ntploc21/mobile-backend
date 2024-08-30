import mongoose, { Model, model, Schema } from "mongoose";
import ModelNames from "../modelNames";

interface IServerBan {
  _id: {
    server: Schema.Types.ObjectId;
    user: Schema.Types.ObjectId;
  };
}

const serverBanSchema = new Schema<IServerBan>(
  {
    _id: {
      server: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.Server,
        required: [true, "Server ID is required!"],
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.User,
        required: [true, "User ID is required!"],
      },
    },
  },
  { timestamps: true }
);

const ServerBan = mongoose.model(ModelNames.Server_Ban, serverBanSchema);

export default ServerBan;
