import { gql } from "apollo-server-express";

const gqlTypes = gql`
  type ChannelRolePermission {
    _id: IDPair
    permissions: String
  }

  type IDPair {
    server_role_id: ID
    channel_id: ID
  }
`;

const gqlAPI = gql`
  type Query {
    syncChannelRolePermission: [ChannelRolePermission]
    getChannelRolesPermissions(channel_id: ID!): [ServerRole]
    getChannelRolePermission(role_id: ID!, channel_id: ID!): ServerRole
  }

  type Mutation {
    createChannelRolePermission(
      role_id: ID!
      channel_id: ID!
      permissions: String
    ): [ServerRole]
    updateChannelRolePermission(
      role_id: ID!
      channel_id: ID!
      permissions: String
    ): ServerRole
    deleteChannelRolePermission(role_id: ID!, channel_id: ID!): [ServerRole]
  }
`;

export default { API: [gqlTypes, gqlAPI] };
