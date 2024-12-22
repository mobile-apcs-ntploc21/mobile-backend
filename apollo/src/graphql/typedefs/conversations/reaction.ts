import { gql } from "apollo-server-express";

const gqlType = gql`
  type Reaction {
    id: ID!
    message_id: ID!
    sender_id: ID!
    emoji_id: ID!
  }
`;

const gqlQuery = gql`
  extend type Query {
    reactions(message_id: ID!): [Reaction]
  }
`;

const gqlMutation = gql`
  input ReactMessageInput {
    sender_id: ID! # The user who reacted
    emoji: ID! # The emoji ID
  }

  extend type Mutation {
    reactMessage(message_id: ID!, input: ReactMessageInput!): [Reaction]
    reactMessageInDM(message_id: ID!, input: ReactMessageInput!): [Reaction]
    unreactMessage(message_id: ID!, input: ReactMessageInput!): [Reaction]
    unreactMessageInDM(message_id: ID!, input: ReactMessageInput!): [Reaction]
  }
`;

const API = [gqlType, gqlQuery, gqlMutation];

export default { API };
