import { model, Schema } from 'mongoose';
import ModelNames from './../../modelNames';

interface IChannelRolePermissions {
  _id: { server_role_id: Schema.Types.ObjectId; channel_id: Schema.Types.ObjectId };
  permissions: string;
  last_modified: Date;
}

const schema = new Schema<IChannelRolePermissions>(
  {
    _id: {
      server_role_id: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.ServerRole,
        required: [true, 'Server Role ID is required!'],
      },
      channel_id: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.Channel,
        required: [true, 'Channel ID is required!'],
      },
    },
    permissions: {
      type: String,
      default: '',
    },
    last_modified: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const ChannelRolePermissions = model<IChannelRolePermissions>(
  ModelNames.ChannelRolePermissions,
  schema
);
export default ChannelRolePermissions;
