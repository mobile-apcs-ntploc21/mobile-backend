import { gql } from "apollo-server-express";

const gqlTypes = gql`
  type ServerRole {
    id: ID!
    server_id: ID!
    name: String
    color: String
    allow_anyone_mention: Boolean
    position: Int
    permissions: String
    is_admin: Boolean
    last_modified: String
    number_of_users: Int
  }
`;

const gqlAPI = gql`
  input CreateServerRoleInput {
    name: String
    color: String
    allow_anyone_mention: Boolean
    permissions: String
    is_admin: Boolean
  }

  input UpdateServerRoleInput {
    name: String
    color: String
    allow_anyone_mention: Boolean
    permissions: String
    is_admin: Boolean
  }

  type Query {
    syncServerRole: [ServerRole]
    getServerRole(role_id: ID!): ServerRole
    getServerRoles(server_id: ID!): [ServerRole]
  }

  type Mutation {
    createServerRole(server_id: ID!, input: CreateServerRoleInput!): ServerRole
    updateServerRole(role_id: ID!, input: UpdateServerRoleInput!): ServerRole
    deleteServerRole(role_id: ID!): ServerRole
  }
`;

export default { API: [gqlTypes, gqlAPI] };
