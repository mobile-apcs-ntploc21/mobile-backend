// pubsub.ts
import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();

export enum PubSubEvents {
  userProfileChanged = "USER_PROFILE_CHANGED",
  userStatusChanged = "USER_STATUS_CHANGED",

  messageAdded = "MESSAGE_ADDED",
  messageDeleted = "MESSAGE_DELETED",
  messageEdited = "MESSAGE_EDITED",

  channelAdded = "CHANNEL_ADDED",
  channelDeleted = "CHANNEL_DELETED",

  serverUpdated = "SERVER_UPDATED",
  serverDeleted = "SERVER_DELETED",
}

/**
 * Publishes an event to the specified Pub/Sub channel.
 *
 * @param {PubSubEvents} eventName - The name of the event to publish.
 * @param {(string | null)} id - Optional ID to specify a particular event channel; if null, the event is broadcast globally.
 * @param {*} data - The data to publish with the event.
 */
export const publishEvent = (
  eventName: PubSubEvents,
  id: string | null,
  data: any
) => {
  try {
    // If id is not provided, broadcast as a global event
    if (!id === null) {
      pubsub.publish(eventName, data);
    } else {
      pubsub.publish(`${eventName}_${id}`, data);
    }
  } catch (error) {
    console.error(`Error publishing event ${eventName}:`, error);
  }
};

export const getAsyncIterator = (event: PubSubEvents, id: string | null) => {
  if (id === null) {
    return pubsub.asyncIterator(event);
  } else {
    return pubsub.asyncIterator(`${event}_${id}`);
  }
};

export default pubsub;
