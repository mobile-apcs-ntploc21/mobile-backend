import mongoose, { ObjectId } from "mongoose";
import { IResolvers } from "@graphql-tools/utils";

import ConversationModel from "@/models/conversations/conversation";
import UserModel from "@/models/user";
import UserProfileModel from "@/models/user_profile";
import DirectMessageModel from "@/models/conversations/direct_message";
import { log } from "@/utils/log";
import MessageModel from "@/models/conversations/message";

interface IProfile {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

const directMessageAPI: IResolvers = {
  Query: {
    getDirectMessage: async (_, { user_first_id, user_second_id }) => {
      const result: any = await DirectMessageModel.findOne({
        "_id.user_first_id": user_first_id,
        "_id.user_second_id": user_second_id,
      });
      if (!result) return null;
      result.latest_message = await MessageModel.findById(
        result.latest_message_id
      );
      return result;
    },
    getDirectMessages: async (_, { user_id }) => {
      const directMessageResult = await DirectMessageModel.find({
        $or: [
          { "_id.user_first_id": user_id },
          { "_id.user_second_id": user_id },
        ],
      });
      for (const dm of directMessageResult) {
        // @ts-ignore
        dm.latest_message = await MessageModel.findById(dm.latest_message_id);
        // @ts-ignore
        console.log(dm.latest_message);
        // @ts-ignore
        if (!dm.latest_message) continue;
        // @ts-ignore
        console.log(dm.latest_message.sender_id);
        const sender = await UserProfileModel.findOne({
          // @ts-ignore
          user_id: dm.latest_message.sender_id,
        });
        // @ts-ignore
        dm.latest_message.author = sender;
      }

      const result = await Promise.all(
        directMessageResult.map(async (dm) => {
          const otherUserId =
            String(dm._id.user_first_id) === user_id
              ? String(dm._id.user_second_id)
              : String(dm._id.user_first_id);

          const otherUser = await UserProfileModel.findOne({
            user_id: otherUserId,
            server_id: null,
          }).lean();

          if (!otherUser) {
            log.info(`User with id ${otherUserId} not found`);
            return null;
          }

          const otherUserMap = new Map<string, IProfile>();
          otherUserMap.set(String(otherUser.user_id), {
            user_id: String(otherUser.user_id),
            username: otherUser.username,
            display_name: otherUser.display_name || otherUser.username,
            avatar_url: otherUser.avatar_url || "",
          });

          // console.log(otherUserMap);

          return {
            direct_message: dm,
            other_user: otherUserMap.get(String(otherUser.user_id)),
          };
        })
      );

      console.log(result);

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
