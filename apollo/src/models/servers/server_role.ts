import { model, Schema } from 'mongoose';
import ModelNames from './../modelNames';

interface IServerRole {
  server_id: Schema.Types.ObjectId;
  name: string;
  color: string;
  allow_anyone_mention: boolean;
  position: number;
  permissions: string;
  is_admin: boolean;
  default: boolean;
  last_modified: Date;
}

const schema = new Schema<IServerRole>(
  {
    server_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.Server,
      required: [true, 'Server ID is required!'],
    },
    name: {
      type: String,
      minlength: [1, 'Role name must be at least 1 characters long!'],
      maxlength: [100, 'Role name must be at most 100 characters long!'],
      required: [true, 'Role name is required!'],
    },
    color: {
      type: String,
      default: '#000000',
    },
    allow_anyone_mention: {
      type: Boolean,
      default: true,
    },
    position: {
      type: Number,
      required: [true, 'Role position is required!'],
    },
    permissions: {
      type: String,
      default: '',
    },
    is_admin: {
      type: Boolean,
      default: false,
    },
    default: {
      type: Boolean,
      default: false,
      required: [true, 'Default attribute is required!'],
    },
    last_modified: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const ServerRoleModel = model<IServerRole>(
  ModelNames.ServerRole,
  schema
);
export default ServerRoleModel;
