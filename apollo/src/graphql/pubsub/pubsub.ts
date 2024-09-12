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

  memberAdded = "MEMBER_ADDED",
  memberRemoved = "MEMBER_REMOVED",

  channelAdded = "CHANNEL_ADDED",
  channelDeleted = "CHANNEL_DELETED",
  channelUpdated = "CHANNEL_UPDATED",

  categoryAdded = "CATEGORY_ADDED",
  categoryDeleted = "CATEGORY_DELETED",
  categoryUpdated = "CATEGORY_UPDATED",

  roleAdded = "ROLE_ADDED",
  roleDeleted = "ROLE_DELETED",
  roleUpdated = "ROLE_UPDATED",

  userRoleAdded = "ADD_USER_TO_ROLE",
  userRoleDeleted = "REMOVE_USER_FROM_ROLE",

  channelRoleAdded = "ADD_CHANNEL_PERMISSIONS_TO_ROLE",
  channelRoleDeleted = "REMOVE_CHANNEL_PERMISSIONS_FROM_ROLE",
  channelRoleUpdated = "UPDATE_CHANNEL_PERMISSIONS_FOR_ROLE",

  categoryRoleAdded = "ADD_CATEGORY_PERMISSIONS_TO_ROLE",
  categoryRoleDeleted = "REMOVE_CATEGORY_PERMISSIONS_FROM_ROLE",
  categoryRoleUpdated = "UPDATE_CATEGORY_PERMISSIONS_FOR_ROLE",

  channelUserAdded = "ADD_CHANNEL_PERMISSIONS_TO_USER",
  channelUserDeleted = "REMOVE_CHANNEL_PERMISSIONS_FROM_USER",
  channelUserUpdated = "UPDATE_CHANNEL_PERMISSIONS_FOR_USER",

  categoryUserAdded = "ADD_CATEGORY_PERMISSIONS_TO_USER",
  categoryUserDeleted = "REMOVE_CATEGORY_PERMISSIONS_FROM_USER",
  categoryUserUpdated = "UPDATE_CATEGORY_PERMISSIONS_FOR_USER",

  messageAdded = "NEW_MESSAGE",
  messageDeleted = "MESSAGE_DELETED",
  messageEdited = "MESSAGE_MODIFIED",
  messagePinAdded = "NEW_MESSAGE_PINNED",
  messagePinRemoved = "MESSAGE_UNPINNED",
  messageReactionAdded = "REACTION_ADDED",
  messageReactionRemoved = "REACTION_REMOVED",
  messageMentionedUser = "USER_MENTIONED",
  messageMentionedRole = "ROLE_MENTIONED",
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
