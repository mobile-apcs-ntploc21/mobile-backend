import UserStatusModel from "../models/user_status";
import { publishStatusChanged } from "../graphql/pubsub/user_status";
import { publishEvent, ServerEvents } from "../graphql/pubsub/pubsub";
import { log } from "@/utils/log";

export const userComeBack = async (user_id: string) => {
  try {
    const res = await UserStatusModel.findOne({ user_id });
    if (!res) throw new Error("User status not found");

    if (res.count_access === 0) res.is_online = true;
    res.count_access++;

    if (res.count_access === 1) {
      publishEvent(ServerEvents.userStatusChanged, {
        type: ServerEvents.userStatusChanged,
        data: res,
      });
      publishStatusChanged(res);
    }

    res.save();
  } catch (error) {
    log.info(error);
  }
};

export const userLeave = async (user_id: string) => {
  if (!user_id) return;
  try {
    const res = await UserStatusModel.findOne({ user_id });
    if (!res) throw new Error("User status not found");

    if (res.count_access === 0)
      throw new Error("Number of access when leaving is 0");
    res.count_access--;

    if (res.count_access === 0) {
      res.is_online = false;
      publishEvent(ServerEvents.userStatusChanged, {
        type: ServerEvents.userStatusChanged,
        data: res,
      });
      publishStatusChanged(res);
    }

    res.save();
  } catch (error) {
    log.error(error);
  }
};

export const userSendPong = async (user_id: string) => {
  try {
    await UserStatusModel.findOneAndUpdate(
      { user_id },
      { $set: { last_seen: new Date() } },
      { new: true }
    );
  } catch (error) {
    log.error(error);
  }
};
