import { IResolvers } from "@graphql-tools/utils";
import { withFilter } from "graphql-subscriptions";
import UserStatusModel from "../../models/user_status";
import DateTime from "../scalars/DateTime";
import UserModel from "../../models/user";
import {
  getAsyncIterator,
  publishStatusChanged,
  UserStatusEvents,
} from "../pubsub/user_status";
import { publishEvent, ServerEvents } from "../pubsub/pubsub";
import { log } from "@/utils/log";
import ServerMemberModel from "@/models/servers/server_member";

export const userStatusResolvers_API: IResolvers = {
  DateTime,
  Query: {
    getUserStatus: async (_, { user_id }) => {
      try {
        // log.debug(user_id);
        const res = await UserStatusModel.findOne({
          user_id,
        });
        // log.debug(res);
        return res;
      } catch (error) {
        log.error(error);
        return null;
      }
    },
    getMultipleUserStatus: async (_, { user_ids }) => {
      try {
        const res = await UserStatusModel.find({
          user_id: { $in: user_ids },
        });
        return res;
      } catch (error) {
        log.error(error);
        return null;
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

        return "Sync completed";
      } catch (error) {
        log.error(error);
        return null;
      }
    },
    updateStatusType: async (_, { user_id, type }) => {
      try {
        const res = await UserStatusModel.findOneAndUpdate(
          { user_id },
          { $set: { last_seen: new Date() } },
          { new: true }
        );

        if (!res) throw new Error("Users status not found");

        if (res.type === type) return res;

        res.type = type;
        await res.save();

        // Update the status of the user in all servers
        const memberServer = await ServerMemberModel.find({
          "_id.user_id": user_id,
        }).lean();
        for (const member of memberServer) {
          publishEvent(ServerEvents.userStatusChanged, {
            type: ServerEvents.userStatusChanged,
            server_id: member._id.server_id,
            data: res,
          });
        }

        publishStatusChanged(res);
        return res;
      } catch (error) {
        log.error(error);
        return null;
      }
    },
    updateStatusText: async (_, { user_id, status_text }) => {
      try {
        const res = await UserStatusModel.findOneAndUpdate(
          { user_id },
          { $set: { status_text } },
          { new: true }
        );

        // Update the status of the user in all servers
        const memberServer = await ServerMemberModel.find({
          "_id.user_id": user_id,
        }).lean();
        for (const member of memberServer) {
          publishEvent(ServerEvents.userStatusChanged, {
            type: ServerEvents.userStatusChanged,
            server_id: member._id.server_id,
            data: res,
          });
        }

        publishStatusChanged(res);
        return res;
      } catch (error) {
        log.error(error);
        return null;
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
          log.error("Subscription userStatusChanged is executing...");

          const thisUserId = context?.thisUserId;
          const user_id = variables?.user_id;

          log.info(
            `UserID: ${payload.userStatusChanged?.user_id} status changed`
          );
          log.info(`Subscription user_id: ${user_id}`);
          log.info("Filtering...");

          if (payload.userStatusChanged?.user_id.toString() !== user_id) {
            log.info("User id does not match the subscription");
            return false;
          }

          log.info("Filter passed");
          return true;
        }
      ),
    },
  },
};
