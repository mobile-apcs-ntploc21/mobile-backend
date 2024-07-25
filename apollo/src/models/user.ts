import mongoose, { model, Schema } from "mongoose";

import validator from "validator";
import UserStatusModel from "./user_status";

interface IUser {
  username: string;
  email: string;
  password: string;
  password_salt: string;
  phone_number: string;
  last_modified: Date;
  verified: boolean;
  age: number;
  refresh_tokens: string[];
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      unique: true,
      minLength: [4, "Username length must greater or equal to 4!"],
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "Please provide your email"],
      validate: [validator.isEmail, "Please provide a valid mail!"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minLength: [6, "Password must have length greater or equal to 6!"],
      select: true,
    },
    phone_number: {
      type: String,
      validate: [
        validator.isMobilePhone,
        "Please provide a valid phone number!",
      ],
    },
    last_modified: {
      type: Date,
      default: Date.now,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    age: {
      type: Number,
      required: [true, "Please provide your age"],
      min: [13, "Age must be greater or equal to 13!"],
    },
    refresh_tokens: [
      {
        token: { type: String, required: true },
        device: { type: String, required: false },
        created_at: { type: Date, default: Date.now },
      },
      { _id: false },
    ],
  },
  { timestamps: true }
);

// Pre middlewares
userSchema.pre("findOneAndDelete", async function (next) {
  const docToDelete = await this.model.findOne(this.getQuery()).exec();
  if (docToDelete) {
    try {
      await UserStatusModel.deleteOne({ user_id: docToDelete._id });
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Post middlewares
userSchema.post("save", async function (doc, next) {
  if (doc.isNew) {
    const newUserStatus = new UserStatusModel({
      user_id: doc._id,
    });

    try {
      await newUserStatus.save();
    } catch (error) {
      return next(error);
    }
  }
});

const UserModel = mongoose.model<IUser>("User", userSchema);

// Migration script to clear old token
const migrateUser = async () => {
  try {
    const users = await UserModel.find();

    for (const user of users) {
      user.refresh_tokens = [];
      await user.save();
    }

    console.log("Migration success!");
  } catch (error) {
    console.log("Migration failed!");
  }
};
// migrateUser();

export default UserModel;
