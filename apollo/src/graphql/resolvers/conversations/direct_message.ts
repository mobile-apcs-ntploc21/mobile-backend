import mongoose, { ObjectId } from "mongoose";
import { IResolvers } from "@graphql-tools/utils";

import ConversationModel from "@/models/conversations/conversation";
import UserModel from "@/models/user";
import UserProfileModel from "@/models/user_profile";
import DirectMessageModel from "@/models/conversations/direct_message";
import LastReadModel from "@/models/conversations/last_read";
import { log } from "@/utils/log";
import MessageModel from "@/models/conversations/message";

import { fetchExtraFields, castToIMessage } from "./message";
import { withFilter } from "graphql-subscriptions";
import { ServerEvents } from "@/graphql/pubsub/pubsub";

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

      const conversationIds = directMessageResult.map(
        (dm) => dm.conversation_id
      );

      for (const dm of directMessageResult) {
        const latestMessage = await MessageModel.findById(dm.latest_message_id);

        if (!latestMessage) {
          // @ts-ignore
          dm.latest_message = null;
          continue;
        }

        const [extraFields] = await fetchExtraFields([latestMessage]);

        // @ts-ignore
        dm.latest_message = latestMessage
          ? await castToIMessage(latestMessage, extraFields)
          : null;
      }

      const lastestMessages = await MessageModel.find({
        conversation_id: { $in: conversationIds },
      }).sort({ createdAt: -1 });

      const lastestMessageMap = lastestMessages.reduce((acc, msg) => {
        // @ts-ignore
        acc[msg.conversation_id] = msg;
        return acc;
      }, {});

      // Initialize the last read data
      let lastReadMessageMap = {};
      if (user_id && user_id !== null) {
        // Fetch the last read information for the user on these channels
        const lastReads = await LastReadModel.find({
          "_id.conversation_id": { $in: conversationIds },
          "_id.user_id": user_id,
        }).lean();

        // Create a map of conversation_id to date of last read
        lastReadMessageMap = await lastReads.reduce((acc, lr) => {
          // @ts-ignore
          acc[lr._id.conversation_id.toString()] = lr.updatedAt;
          return acc;
        }, {});
      }

      const result = await Promise.all(
        directMessageResult.map(async (dm) => {
          const otherUserId =
            String(dm._id.user_first_id) === user_id
              ? String(dm._id.user_second_id)
              : String(dm._id.user_first_id);

          const conversation_id = (dm.conversation_id || "").toString();
          // @ts-ignore
          const lastReadMessage = lastReadMessageMap[conversation_id] || 0;

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

          dm.number_of_unread_mentions = 0;
          // @ts-ignore
          if (user_id && dm.latest_message) {
            const unreadMentions = await MessageModel.countDocuments({
              conversation_id: conversation_id,
              user_id: user_id,
              createdAt: { $gt: lastReadMessage },
            });

            dm.number_of_unread_mentions = unreadMentions;
          }

          dm.has_new_message = dm.number_of_unread_mentions > 0;

          return {
            direct_message: dm,
            other_user: otherUserMap.get(String(otherUser.user_id)),
          };
        })
      );

      const filteredResult = result.filter((r) => r !== null);

      return filteredResult;
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
      resolve: (payload) => ({
        ...payload,
        conversation_id: payload?.conversation_id || null,
      }),
      async subscribe(rootValue, args, context) {
        const { directMessagePubSub } = context;
        return withFilter(
          () => {
            return directMessagePubSub.asyncIterator(
              Object.values(ServerEvents)
            );
          },
          async (payload, variables, context) => {
            // Payload data (i.e., the data that the server sends)
            const conversation_id = String(payload?.conversation_id) || null;
            const v_conversation_id = variables.conversation_id;
            return conversation_id === v_conversation_id;
          }
        )(rootValue, args, context);
      },
    },
  },
};

export { directMessageAPI, directMessageWs };
