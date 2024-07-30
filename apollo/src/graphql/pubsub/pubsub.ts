// pubsub.ts
import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();

export enum ServerEvents {
  userProfileChanged = "USER_PROFILE_CHANGED",
  userStatusChanged = "USER_STATUS_CHANGED",

  memberJoined = "MEMBER_JOINED",
  memberLeft = "MEMBER_LEFT",
  memberUpdated = "MEMBER_UPDATED",

  emojiAdded = "EMOJI_ADDED",
  emojiUpdated = "EMOJI_UPDATED",
  emojiDeleted = "EMOJI_DELETED",

  serverUpdated = "SERVER_UPDATED",
  serverDeleted = "SERVER_DELETED",
}

export enum ChannelEvents {
  messageAdded = "MESSAGE_ADDED",
  messageDeleted = "MESSAGE_DELETED",
  messageEdited = "MESSAGE_EDITED",

  channelAdded = "CHANNEL_ADDED",
  channelDeleted = "CHANNEL_DELETED",
  channelUpdated = "CHANNEL_UPDATED",
}

/**
 * Publishes an event to the specified Pub/Sub channel.
 *
 * @param {string} eventName - The name of the event to publish.
 * @param {*} data - The data to publish with the event.
 */
export const publishEvent = (eventName: string, data: any) =>
  pubsub.publish(eventName, data);

/**
 * Returns an async iterator for the specified Pub/Sub channels.
 *
 * @param {string[]} events - The Pub/Sub channels to listen to.
 * @returns {*} - The async iterator.
 */
export const getAsyncIterator = (events: string[]) =>
  pubsub.asyncIterator(events);
