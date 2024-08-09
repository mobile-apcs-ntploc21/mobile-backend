import mongoose, { model, Schema } from "mongoose";

interface IServerBan {
  server: { type: Schema.Types.ObjectId };
  user: { type: Schema.Types.ObjectId };
}

const serverBanSchema = new Schema<IServerBan>(
  {
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
  { timestamps: true, _id: false }
);

const ServerBan = mongoose.model("ServerBan", serverBanSchema);

export default ServerBan;
