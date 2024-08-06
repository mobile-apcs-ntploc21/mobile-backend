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

/// Category Permission
interface ICategoryPermission {
  channel_id: { type: Schema.Types.ObjectId };
  server_role_id: { type: Schema.Types.ObjectId };
  user_id: { type: Schema.Types.ObjectId };

  // Permissions
  is_user: boolean;
  allow: string; // Bitwise
  deny: string; // Bitwise
}

const channelPermissionSchema = new Schema<ICategoryPermission>(
  {
    channel_id: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      required: [true, "Channel ID is required!"],
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

const CategoryPermission = model<ICategoryPermission>(
  "CategoryPermission",
  channelPermissionSchema
);

export { Category, CategoryPermission };
