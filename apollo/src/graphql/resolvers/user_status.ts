import { IResolvers } from '@graphql-tools/utils';
import { withFilter } from 'graphql-subscriptions';
import UserStatusModel from '../../models/user_status';
import DateTime from '../scalars/DateTime';
import UserModel from '../../models/user';
import {
  getAsyncIterator,
  publishStatusChanged,
  UserStatusEvents,
} from '../pubsub/user_status';
import { wsLogger } from '../../utils';
import { publishEvent, ServerEvents } from '../pubsub/pubsub';

export const userStatusResolvers_API: IResolvers = {
  DateTime,
  Query: {
    getUserStatus: async (_, { user_id }) => {
      try {
        // console.log(user_id);
        const res = await UserStatusModel.findOne({
          user_id,
        });
        // console.log(res);
        return res;
      } catch (error) {
        console.log(error);
      }
    },
    getMultipleUserStatus: async (_, { user_ids }) => {
      try {
        const res = await UserStatusModel.find({
          user_id: { $in: user_ids },
        });
        return res;
      } catch (error) {
        console.log(error);
      }
    },
  },
  Mutation: {
    syncUsers: async () => {
      try {
        const users = await UserModel.find();
        const userIds = users.map((user) => user._id);

        const syncPromises = users.map((user) =>
          UserStatusModel.findOneAndUpdate(
            { user_id: user.id },
            {
              user_id: user.id,
              $setOnInsert: {
                last_seen: new Date(),
              },
            },
            {
              new: true,
              upsert: true,
            }
          )
        );
        await Promise.all(syncPromises);

        await UserStatusModel.deleteMany({
          user_id: { $nin: userIds },
        });

        return 'Sync completed';
      } catch (error) {
        console.log(error);
      }
    },
    updateStatusType: async (_, { user_id, type }) => {
      try {
        const res = await UserStatusModel.findOneAndUpdate(
          { user_id },
          { $set: { last_seen: new Date() } },
          { new: true }
        );

        if (res.type === type) return res;

        res.type = type;
        await res.save();

        publishEvent(ServerEvents.userStatusChanged, {
          type: ServerEvents.userStatusChanged,
          data: res,
        });
        publishStatusChanged(res);
        return res;
      } catch (error) {
        console.log(error);
      }
    },
    updateStatusText: async (_, { user_id, status_text }) => {
      try {
        const res = await UserStatusModel.findOneAndUpdate(
          { user_id },
          { $set: { status_text } },
          { new: true }
        );

        publishEvent(ServerEvents.userStatusChanged, {
          type: ServerEvents.userStatusChanged,
          data: res,
        });
        publishStatusChanged(res);
        return res;
      } catch (error) {
        console.log(error);
      }
    },
  },
};

export const userStatusResolvers_Ws: IResolvers = {
  Subscription: {
    userStatusChanged: {
      subscribe: withFilter(
        () => getAsyncIterator([UserStatusEvents.statusChanged]),
        (payload, variables, context) => {
          wsLogger('Subscription userStatusChanged is executing...');

          const thisUserId = context?.thisUserId;
          const user_id = variables?.user_id;

          console.log(
            `UserID: ${payload.userStatusChanged?.user_id} status changed`
          );
          console.log(`Subscription user_id: ${user_id}`);
          console.log('Filtering...');

          if (payload.userStatusChanged?.user_id.toString() !== user_id) {
            console.log('User id does not match the subscription');
            return false;
          }

          console.log('Filter passed');
          return true;
        }
      ),
    },
  },
};
