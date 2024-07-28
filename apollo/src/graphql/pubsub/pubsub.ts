// pubsub.ts
import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();

export enum PubSubEvents {
  userProfileChanged = "USER_PROFILE_CHANGED",
  userStatusChanged = "USER_STATUS_CHANGED",

  memberJoined = "MEMBER_JOINED",
  memberLeft = "MEMBER_LEFT",
  memberUpdated = "MEMBER_UPDATED",

  messageAdded = "MESSAGE_ADDED",
  messageDeleted = "MESSAGE_DELETED",
  messageEdited = "MESSAGE_EDITED",

  channelAdded = "CHANNEL_ADDED",
  channelDeleted = "CHANNEL_DELETED",
  channelUpdated = "CHANNEL_UPDATED",

  emojiAdded = "EMOJI_ADDED",
  emojiUpdated = "EMOJI_UPDATED",
  emojiDeleted = "EMOJI_DELETED",

  serverUpdated = "SERVER_UPDATED",
  serverDeleted = "SERVER_DELETED",
}

/**
 * Publishes an event to the specified Pub/Sub channel.
 *
 * @param {PubSubEvents} eventName - The name of the event to publish.
 * @param {*} data - The data to publish with the event.
 */
export const publishEvent = (eventName: PubSubEvents, data: any) =>
  pubsub.publish(eventName, data);

/**
 * Returns an async iterator for the specified Pub/Sub channels.
 *
 * @param {PubSubEvents[]} events - The Pub/Sub channels to listen to.
 * @returns {*} - The async iterator.
 */
export const getAsyncIterator = (events: PubSubEvents[]) =>
  pubsub.asyncIterator(events);
