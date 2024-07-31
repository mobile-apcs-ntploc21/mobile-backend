import { model, Schema } from 'mongoose';
import ModelNames from './modelNames';

interface IServerMember {
  _id: { server_id: Schema.Types.ObjectId; user_id: Schema.Types.ObjectId };
}

const schema = new Schema<IServerMember>(
  {
    _id: {
      server_id: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.Server,
        required: [true, 'Server ID is required!'],
      },
      user_id: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.User,
        required: [true, 'User ID is required!'],
      },
    },
  },
  { timestamps: true, _id: false }
);

const ServerMemberModel = model<IServerMember>(
  ModelNames.Server_Member,
  schema
);
export default ServerMemberModel;
