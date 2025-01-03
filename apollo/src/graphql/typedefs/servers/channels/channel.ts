import { gql } from "apollo-server-express";
import Message from "../../conversations/message";

const gqlTypes = [
  Message.type,
  gql`
    type Channel {
      id: ID
      server_id: ID
      conversation_id: ID
      category_id: ID

      name: String
      description: String
      last_message_id: ID
      position: Int

      last_message: Message
      has_new_message: Boolean
      number_of_unread_mentions: Int

      is_nsfw: Boolean
      is_archived: Boolean
      is_deleted: Boolean
    }
  `,
];

const gqlAPI = gql`
  input createChannelInput {
    name: String!
    category_id: ID
    is_private: Boolean
  }

  input updateChannelInput {
    name: String
    description: String
    is_private: Boolean
    is_nsfw: Boolean
    is_archived: Boolean
    is_deleted: Boolean
  }

  input moveChannelInput {
    channel_id: ID!
    category_id: ID
    position: Int
  }

  extend type Query {
    getChannel(channel_id: ID!): Channel
    getChannels(server_id: ID!, user_id: ID): [Channel]
  }

  extend type Mutation {
    createChannel(server_id: ID!, input: createChannelInput!): Channel
    updateChannel(channel_id: ID!, input: updateChannelInput!): Channel
    deleteChannel(channel_id: ID!): Boolean
    hardDeleteChannel(channel_id: ID!): Boolean

    # Move channel to a new category
    moveChannel(channel_id: ID!, category_id: ID, new_position: Int): Channel
    moveAllChannel(server_id: ID!, input: [moveChannelInput!]!): [Channel]

    # Sync channel with conversation
    syncChannel(server_id: ID): Boolean

    # Sync channel and topic in FCM
    syncFCM: Boolean
  }
`;

const gqlWs = gql`
  extend type Subscription {
    channelUpdated(channel_id: ID!): Channel
  }
`;

const API = [gqlTypes, gqlAPI];
const WS = [gqlTypes, gqlWs];

export default { API, WS };
