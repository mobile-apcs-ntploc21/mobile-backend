import { IResolvers } from "@graphql-tools/utils";
import { UserInputError } from "apollo-server";
import mongoose, { Query } from "mongoose";

// import ServerEmoji from "@/models/servers/serverEmoji";
import serverModel from "@/models/servers/server";
import EmojiModel from "@/models/emojis";
import AttachmentModel from "@/models/conversations/attachment";

// ===========================

enum AttachmentType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  FILE = "FILE",
  AUDIO = "AUDIO",
}

interface IAttachment {
  type: AttachmentType;
  url: string;
  filename: string;
  size: number;
}

const cronjobResolver: IResolvers = {
  Query: {
    deletedEmojis: async () => {
      const emojis = await EmojiModel.find({ is_deleted: true });
      return emojis;
    },
    availableAttachments: async (_) => getAvailableAttachments(),
  },
};

const getAvailableAttachments = async (): Promise<IAttachment[]> => {
  const attachments = await AttachmentModel.find().lean();
  return attachments.map((attachment) => ({
    type: attachment.attachment_type as AttachmentType,
    url: attachment.attachment_url,
    filename: attachment.filename,
    size: attachment.size,
  }));
};

export default cronjobResolver;
