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
    getChannelRolePermission(role_id: ID!, channel_id: ID!): ChannelRolePermission
  }

  type Mutation {
    createChannelRolePermission(role_id: ID!, channel_id: ID!, permissions: String): ChannelRolePermission
    updateChannelRolePermission(role_id: ID!, channel_id: ID!, permissions: String): ChannelRolePermission
    deleteChannelRolePermission(role_id: ID!, channel_id: ID!): ChannelRolePermission
  }
`;

export default { API: [gqlTypes, gqlAPI] };
