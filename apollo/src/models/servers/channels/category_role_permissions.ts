import { model, Schema } from 'mongoose';
import ModelNames from './../../modelNames';

interface ICategoryRolePermissions {
  _id: { server_role_id: Schema.Types.ObjectId; category_id: Schema.Types.ObjectId };
  permissions: string;
  last_modified: Date;
}

const schema = new Schema<ICategoryRolePermissions>(
  {
    _id: {
      server_role_id: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.ServerRole,
        required: [true, 'Server Role ID is required!'],
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

const CategoryRolePermissions = model<ICategoryRolePermissions>(
  ModelNames.CategoryRolePermissions,
  schema
);
export default CategoryRolePermissions;
