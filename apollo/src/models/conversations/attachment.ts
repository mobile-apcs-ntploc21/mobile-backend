import mongoose, { model, Schema } from "mongoose";
import validator from "validator";
import ModelNames from "./../modelNames";

export enum AttachmentContentTypes {
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
  FILE = "file",
}

interface IAttachment {
  message_id: Schema.Types.ObjectId;
  sender_id: Schema.Types.ObjectId;
  attachment_url: string;
  content_type: string;
  last_modified: Date;
}

const attachmentSchema = new Schema<IAttachment>(
  {
    message_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.Message,
      required: [true, "Message ID is required!"],
    },
    sender_id: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.User,
      required: [true, "Sender ID is required!"],
    },
    attachment_url: {
      type: String,
      required: [true, "Attachment URL is required!"],
    },
    content_type: {
      type: String,
      required: [true, "Content Type is required!"],
    },
    last_modified: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const AttachmentModel = mongoose.model<IAttachment>(
  ModelNames.Attachment,
  attachmentSchema
);
export default AttachmentModel;
