import mongoose, { ObjectId } from "mongoose";
import { IResolvers } from "@graphql-tools/utils";

import ConversationModel from "@/models/conversations/conversation";
import UserModel from "@/models/user";
import DirectMessageModel from "@/models/conversations/direct_message";
import { log } from "@/utils/log";
import MessageModel from "@/models/conversations/message";

const directMessageAPI: IResolvers = {
  Query: {
    getDirectMessage: async (_, { conversation_id }) => {
      const result: any = await DirectMessageModel.findOne({ conversation_id });
      if (!result) return null;
      result.latest_message = await MessageModel.findById(
        result.latest_message_id
      );
      return result;
    },
    getDirectMessages: async (_, { user_id }) => {
      const result = await DirectMessageModel.find({
        $or: [
          { "_id.user_first_id": user_id },
          { "_id.user_second_id": user_id },
        ],
      });
      // eslint-disable-next-line prettier/prettier
      for (const dm of result)
        // @ts-ignore
        dm.latest_message = await MessageModel.findById(dm.latest_message_id);
      return result;
    },
  },
  Mutation: {
    createDirectMessage: async (
      _,
      { user_first_id: uid1, user_second_id: uid2 }
    ) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        if (UserModel.findById(uid1).session(session) === null) {
          throw new Error(`User with id ${uid1} not found`);
        }
        if (UserModel.findById(uid2).session(session) === null)
          throw new Error(`User with id ${uid2} not found`);
        if (uid1 === uid2) throw new Error(`User ids must be different`);

        if (uid1 > uid2) [uid1, uid2] = [uid2, uid1];

        const [conversation] = await ConversationModel.create([{}], {
          session,
        });
        const [dm] = await DirectMessageModel.create(
          [
            {
              _id: {
                user_first_id: uid1,
                user_second_id: uid2,
              },
              conversation_id: conversation._id,
            },
          ],
          { session }
        );

        await session.commitTransaction();
        return dm;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },
    deleteDirectMessage: async (_, { conversation_id }) => {
      const result = await DirectMessageModel.deleteOne({ conversation_id });
      return result.deletedCount > 0;
    },
  },
};

const directMessageWs: IResolvers = {
  Subscription: {
    directMessageUpdated: {
      subscribe: async (_, { conversation_id }, { pubsub }) => {
        return pubsub.asyncIterator(
          `DIRECT_MESSAGE_UPDATED_${conversation_id}`
        );
      },
    },
  },
};

export { directMessageAPI, directMessageWs };
