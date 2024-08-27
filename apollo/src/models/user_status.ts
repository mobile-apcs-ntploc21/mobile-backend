import { Schema, model } from "mongoose";
import ModelNames from "./modelNames";

export enum CustomStatus {
  ONLINE = "ONLINE",
  IDLE = "IDLE",
  DO_NOT_DISTURB = "DO_NOT_DISTURB",
  INVISIBLE = "INVISIBLE",
  OFFLINE = "OFFLINE",
}

type UserStatus = {
  user_id: Schema.Types.ObjectId;
  type: CustomStatus;
  last_seen: Date;
  status_text: string;
  is_online: boolean;
};

const schema = new Schema<UserStatus>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required!"],
  },
  type: {
    type: String,
    enum: Object.values(CustomStatus),
    required: [true, "Status type is required!"],
    default: CustomStatus.ONLINE,
  },
  last_seen: {
    type: Date,
    required: [true, "Last seen is required!"],
    default: Date.now,
  },
  status_text: {
    type: String,
    maxlength: [140, "Status text must not exceed 140 characters!"],
    default: "",
  },
  is_online: {
    type: Boolean,
    required: [true, "Online status is required!"],
    default: false,
  },
});

const UserStatusModel = model<UserStatus>(ModelNames.UserStatus, schema);

export default UserStatusModel;
