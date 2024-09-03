import mongoose, { Schema, model } from "mongoose";

/// Category Permission
interface ICategoryPermission {
  category_id: { type: Schema.Types.ObjectId };
  server_role_id: { type: Schema.Types.ObjectId };
  user_id: { type: Schema.Types.ObjectId };

  // Permissions
  is_user: boolean;
  allow: string; // Bitwise
  deny: string; // Bitwise
}

const channelPermissionSchema = new Schema<ICategoryPermission>(
  {
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category ID is required!"],
    },
    server_role_id: {
      type: Schema.Types.ObjectId,
      ref: "ServerRole",
      required: false,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    is_user: {
      type: Boolean,
      default: false,
    },
    allow: {
      type: String,
      default: "",
    },
    deny: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const CategoryPermission = mongoose.model<ICategoryPermission>(
  "CategoryPermission",
  channelPermissionSchema
);

export default CategoryPermission;
