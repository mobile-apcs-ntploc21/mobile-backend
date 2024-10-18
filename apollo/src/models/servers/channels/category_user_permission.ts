import { model, Schema } from "mongoose";
import ModelNames from "./../../modelNames";

interface ICategoryUserPermission {
  _id: { user_id: Schema.Types.ObjectId; category_id: Schema.Types.ObjectId };
  permissions: string;
  last_modified: Date;
}

const schema = new Schema<ICategoryUserPermission>(
  {
    _id: {
      user_id: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.User,
        required: [true, "User ID is required!"],
      },
      category_id: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.Category,
        required: [true, "Category ID is required!"],
      },
    },
    permissions: {
      type: String,
      default: "",
    },
    last_modified: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const CategoryUserPermission = model<ICategoryUserPermission>(
  ModelNames.CategoryUserPermission,
  schema
);
export default CategoryUserPermission;
