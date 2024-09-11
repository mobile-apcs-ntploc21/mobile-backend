import { gql } from "apollo-server-express";

const gqlTypes = gql`
  type LastRead {
    user_id: ID
    conversation_id: ID
    last_message_read_id: ID
  }
`;

const gqlAPI = gql`
  input LastReadInput {
    user_id: ID!
    conversation_id: ID!
    message_id: ID
  }

  extend type Query {
    getLastRead(user_id: ID!, conversation_id: ID!): LastRead
  }

  extend type Mutation {
    createLastRead(input: LastReadInput!): LastRead
    updateLastRead(input: LastReadInput!): LastRead
  }
`;

const API = [gqlTypes, gqlAPI];

export default { API: API };
