import { model, Schema } from "mongoose";
import ModelNames from "./../modelNames";

interface IAssignedUserRole {
  _id: {
    server_role_id: Schema.Types.ObjectId;
    user_id: Schema.Types.ObjectId;
  };
  last_modified: Date;
}

const schema = new Schema<IAssignedUserRole>(
  {
    _id: {
      server_role_id: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.ServerRole,
        required: [true, "Server Role ID is required!"],
      },
      user_id: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.User,
        required: [true, "User ID is required!"],
      },
    },
    last_modified: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, _id: false }
);

const AssignedUserRoleModel = model<IAssignedUserRole>(
  ModelNames.AssignedUserRole,
  schema
);
export default AssignedUserRoleModel;
