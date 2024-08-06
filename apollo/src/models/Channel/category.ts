import mongoose, { model, Schema } from "mongoose";
import validator from "validator";

interface ICategory {
  server_id: { type: Schema.Types.ObjectId };

  // Overview
  name: string;
  position: number;

  // Settings
  private: {
    is_private: boolean;
    role_id: [{ type: Schema.Types.ObjectId }];
    user_id: [{ type: Schema.Types.ObjectId }];
  };
}

const categorySchema = new Schema<ICategory>(
  {
    server_id: {
      type: Schema.Types.ObjectId,
      ref: "Server",
    },
    name: {
      type: String,
      minlength: [1, "Category name must be at least 1 characters long!"],
      maxlength: [100, "Category name must be at most 100 characters long!"],
      required: [true, "Category name is required!"],
    },
    position: {
      type: Number,
      required: [true, "Category position is required!"],
    },
    private: {
      is_private: {
        type: Boolean,
        default: false,
      },
      role_id: [
        {
          type: Schema.Types.ObjectId,
          ref: "Role",
        },
      ],
      user_id: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
  },
  { timestamps: true }
);

const Category = model<ICategory>("Category", categorySchema);

export default Category;
