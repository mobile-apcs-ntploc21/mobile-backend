import mongoose, { model, Schema } from "mongoose";

import validator from "validator";
import UserStatusModel from "./user_status";
import ModelNames from "./modelNames";

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

const UserModel = mongoose.model<IUser>(ModelNames.User, userSchema);
export default UserModel;
