import { model, Schema } from 'mongoose';
import ModelNames from './../../modelNames';

interface ICategoryUserPermissions {
  _id: { user_id: Schema.Types.ObjectId; category_id: Schema.Types.ObjectId };
  permissions: string;
  last_modified: Date;
}

const schema = new Schema<ICategoryUserPermissions>(
  {
    _id: {
      user_id: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.User,
        required: [true, 'User ID is required!'],
      },
      category_id: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.Category,
        required: [true, 'Category ID is required!'],
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

const CategoryUserPermissions = model<ICategoryUserPermissions>(
  ModelNames.CategoryUserPermissions,
  schema
);
export default CategoryUserPermissions;
