import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

export enum UserStatusEvents {
  statusChanged = 'STATUS_CHANGED',
}

export const getAsyncIterator = (events: UserStatusEvents[]) =>
  pubsub.asyncIterator(events);

export const publishStatusChanged = (data: any) => {
  pubsub.publish(UserStatusEvents.statusChanged, {
    userStatusChanged: data,
  });
};
