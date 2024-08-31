import { gql } from "apollo-server-express";

const gqlTypes = gql`
  type ServerBan {
    server_id: ID
    user_id: ID
  }
`;

const gqlQueries = gql`
  extend type Query {
    getServerBan(server_id: ID!, user_id: ID!): ServerBan
    getServerBans(server_id: ID!, limit: Int): [UserProfile]
  }
`;

const gqlMutations = gql`
  extend type Mutation {
    createServerBan(server_id: ID!, user_id: ID!): ServerBan
    createServerBulkBan(server_id: ID!, user_ids: [ID]!): [ServerBan]
    deleteServerBan(server_id: ID!, user_id: ID!): Boolean

    createServerKick(server_id: ID!, user_id: ID!): Boolean
  }
`;

const gqlAPI = [gqlTypes, gqlQueries, gqlMutations];

export default { API: gqlAPI };
