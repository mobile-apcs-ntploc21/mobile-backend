import { model, Schema } from 'mongoose';
import ModelNames from './../../modelNames';

interface IChannelUserPermissions {
  _id: { user_id: Schema.Types.ObjectId; channel_id: Schema.Types.ObjectId };
  permissions: string;
  last_modified: Date;
}

const schema = new Schema<IChannelUserPermissions>(
  {
    _id: {
      user_id: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.User,
        required: [true, 'User ID is required!'],
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

const ChannelUserPermissions = model<IChannelUserPermissions>(
  ModelNames.ChannelUserPermissions,
  schema
);
export default ChannelUserPermissions;
