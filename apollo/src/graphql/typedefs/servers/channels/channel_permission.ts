import { gql } from "apollo-server-express";

const typeDefs = gql`
  type ChannelPermission {
    id: ID!
    channel_id: ID!
    server_role_id: ID
    user_id: ID
    is_user: Boolean!
    allow: String!
    deny: String!
  }

  input CreateChannelPermissionInput {
    server_role_id: ID
    user_id: ID
    is_user: Boolean!
    allow: String!
    deny: String!
  }

  input UpdateChannelPermissionInput {
    server_role_id: ID
    user_id: ID
    is_user: Boolean
    allow: String
    deny: String
  }

  extend type Query {
    getChannelPermissions(channel_id: ID!): [ChannelPermission]
  }

  extend type Mutation {
    createChannelPermission(
      channel_id: ID!
      input: CreateChannelPermissionInput!
    ): ChannelPermission

    updateChannelPermission(
      channel_id: ID!
      input: UpdateChannelPermissionInput!
    ): ChannelPermission

    deleteChannelPermission(id: ID!): Boolean
  }
`;

export default typeDefs;
