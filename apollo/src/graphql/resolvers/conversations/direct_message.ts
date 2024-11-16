import mongoose, { ObjectId } from "mongoose";

import ConversationModel from "@/models/conversations/conversation";
import UserModel from "@/models/user";
import DirectMessageModel from "@/models/conversations/direct_message";
import { IResolvers } from "@graphql-tools/utils";

const directMessageAPI: IResolvers = {
  Query: {
    getDirectMessage: async (_, { conversation_id }) => {
      return await DirectMessageModel.findById(conversation_id);
    },
    getDirectMessages: async (_, { user_id }) => {
      return await DirectMessageModel.find({
        $or: [
          { "_id.user_first_id": user_id },
          { "_id.user_second_id": user_id },
        ],
      });
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
        const dm = await DirectMessageModel.create(
          {
            _id: {
              user_first_id: uid1,
              user_second_id: uid2,
            },
            conversation_id: conversation._id,
          },
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
      return await DirectMessageModel.deleteOne({ conversation_id });
    },
  },
};

export { directMessageAPI };
