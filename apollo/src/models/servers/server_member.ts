import { model, Schema } from "mongoose";
import ModelNames from "./../modelNames";

interface IServerMember {
  _id: { server_id: Schema.Types.ObjectId; user_id: Schema.Types.ObjectId };
  is_favorite?: boolean;
  position?: number;
}

const schema = new Schema<IServerMember>(
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
    is_favorite: {
      type: Boolean,
      default: false,
    },
    position: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, _id: false }
);

// Add compound index for server_id and user_id for a user's membership in a server
schema.index({ server_id: 1, user_id: 1 }, { unique: true });
// Add index for user_id for finding all servers a user is a member of
schema.index({ user_id: 1 });

const ServerMemberModel = model<IServerMember>(
  ModelNames.Server_Member,
  schema
);
export default ServerMemberModel;
