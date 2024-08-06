import { gql } from "apollo-server-express";

const gqlTypes = gql`
  type privateChannel {
    is_private: Boolean
    role_id: [ID]
    user_id: [ID]
  }

  type Channel {
    id: ID
    server_id: ID
    conversation_id: ID
    category_id: ID

    name: String
    description: String
    last_message_id: ID
    position: Int

    private: privateChannel
    is_nsfw: Boolean
    is_archived: Boolean
    is_deleted: Boolean
  }
`;

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

  extend type Query {
    getChannel(channel_id: ID!): Channel
    getChannels(server_id: ID!): [Channel]
  }

  extend type Mutation {
    createChannel(server_id: ID!, input: createChannelInput!): Channel
    updateChannel(channel_id: ID!, input: updateChannelInput!): Channel
    deleteChannel(channel_id: ID!): Channel

    addCategory(channel_id: ID!, category_id: ID!, new_position: Int): Channel
    removeCategory(channel_id: ID!): Channel

    addPrivateChannelID(channel_id: ID!, id: ID!, is_user: Boolean): Channel
    removePrivateChannelID(channel_id: ID!, id: ID!, is_user: Boolean): Channel

    moveChannel(channel_id: ID!, new_position: Int): Channel
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
