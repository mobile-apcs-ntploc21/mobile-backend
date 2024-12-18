import { IResolvers } from "@graphql-tools/utils";
import mongoose, { Query, model, Schema } from "mongoose";
import { UserInputError } from "apollo-server";

// import ServerEmoji from "@/models/servers/serverEmoji";
import serverModel from "@/models/servers/server";
import EmojiModel from "@/models/emojis";
import MessageModel from "@/models/conversations/message";
import AttachmentModel from "@/models/conversations/attachment";
import UserSubscriptionModel from "@/models/payment/subscriptions";

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

interface IEmoji {
  name: string;
  image_url: string;

  type: string;

  // For unicode emojis
  unicode: string;
  category: string;

  // For server emojis
  is_deleted: boolean;
  server_id: Schema.Types.ObjectId;
  uploader_id: Schema.Types.ObjectId;
}

interface ISubscriptions {
  user_id: Schema.Types.ObjectId;
  package_id: Schema.Types.ObjectId;

  is_active: boolean;
  startDate: Date;
  endDate: Date;
}

// ===========================

const cronjobResolver: IResolvers = {
  Query: {
    deletedEmojis: async () => getUnusedDeletedEmojis(),
    availableAttachments: async (_) => getAvailableAttachments(),
  },
  Mutation: {
    cleanupSubscriptions: async () => cleanupSubscriptionsTransaction(),
  },
};

const emoji_regex = /<:(.*?):([a-f0-9]{24})>/g;

function getMatches(string: string, regex: RegExp, index: number) {
  const matches = [];
  let match;
  while ((match = regex.exec(string))) {
    matches.push(match[index]);
  }
  return matches;
}

const castToISubscriptions = (subscriptions: any): ISubscriptions[] => {
  return subscriptions.map((subscription: any) => ({
    user_id: subscription.user_id,
    package_id: subscription.package_id,
    is_active: subscription.is_active,
    startDate: subscription.startDate,
    endDate: subscription.endDate,
  }));
};

const cleanupSubscriptionsTransaction = async (): Promise<ISubscriptions[]> => {
  const session = await mongoose.startSession();
  let subscriptions;

  try {
    session.startTransaction();

    const now = new Date();
    subscriptions = await UserSubscriptionModel.find({
      endDate: { $lt: now },
    }).lean();

    await UserSubscriptionModel.updateMany(
      { endDate: { $lt: now } },
      {
        $set: {
          is_active: false,
          package_id: null,
          startDate: null,
        },
      },
      { session }
    );

    await session.commitTransaction();
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }

  const castedSubscriptions = castToISubscriptions(subscriptions);

  return castedSubscriptions ?? [];
};

const getUnusedDeletedEmojis = async (): Promise<IEmoji[]> => {
  const emojis = await EmojiModel.find({ is_deleted: true });
  const allMessages = await MessageModel.find().lean();
  const allEmojis = allMessages
    .map((message) => getMatches(message.content, emoji_regex, 2))
    .flat();
  return emojis.filter((emoji) => !allEmojis.includes(emoji._id.toString()));
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
