import mongoose, { model, Schema } from "mongoose";

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
        ref: "Server",
        required: [true, "Server ID is required!"],
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required!"],
      },
    },
  },
  { timestamps: true }
);

const ServerBan = mongoose.model("ServerBan", serverBanSchema);

export default ServerBan;
