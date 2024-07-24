import UserStatusModel from '../models/user_status';
import { publishStatusChanged } from '../graphql/pubsub/user_status';

export const userComeBack = async (user_id: string) => {
  try {
    const res = await UserStatusModel.findOneAndUpdate(
      { user_id },
      { $set: { last_seen: new Date(), is_online: true } },
      { new: true }
    );
    publishStatusChanged(res);
  } catch (error) {
    console.log(error);
  }
};

export const userLeave = async (user_id: string) => {
  if (!user_id) return;
  try {
    const res = await UserStatusModel.findOneAndUpdate(
      { user_id },
      { $set: { last_seen: new Date(), is_online: false } },
      { new: true }
    );
    publishStatusChanged(res);
  } catch (error) {
    console.log(error);
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
    console.log(error);
  }
};
