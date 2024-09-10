import mongoose, { model, Schema } from "mongoose";
import ModelNames from "./../../modelNames";

interface ICategory {
  server_id: { type: Schema.Types.ObjectId };

  // Overview
  name: string;
  position: number;
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
  },
  { timestamps: true }
);

categorySchema.index({ server_id: 1 });

const Category = model<ICategory>(ModelNames.Category, categorySchema);

export default Category;
