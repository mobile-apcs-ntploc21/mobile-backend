import { gql } from "apollo-server-express";
import Message from "./message";

const gqlTypes = [
  Message.type,
  gql`
    type IDPair {
      user_first_id: ID
      user_second_id: ID
    }

    type DirectMessage {
      _id: IDPair
      conversation_id: ID
      latest_message: Message
      has_new_message: Boolean
      number_of_unread_mentions: Int
    }
  `,
];

const gqlAPI = gql`
  extend type Query {
    getDirectMessage(user_first_id: ID!, user_second_id: ID!): DirectMessage
    getDirectMessages(user_id: ID!): [DirectMessage]
  }

  extend type Mutation {
    createDirectMessage(user_first_id: ID!, user_second_id: ID!): DirectMessage
    deleteDirectMessage(conversation_id: ID!): Boolean
  }
`;

const gqlWs = gql`
  extend type Subscription {
    directMessageUpdated(conversation_id: ID!): DirectMessage
  }
`;

const API = [gqlTypes, gqlAPI];
const WS = [gqlTypes, gqlWs];

export default { API, WS };
