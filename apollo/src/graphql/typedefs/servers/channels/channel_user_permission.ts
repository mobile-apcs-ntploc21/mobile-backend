import { gql } from "apollo-server-express";

const gqlTypes = gql`
  type ChannelUserPermission {
    _id: IDPair
    permissions: String
  }

  type IDPair {
    user_id: ID
    channel_id: ID
  }
`;

const gqlAPI = gql`
  type Query {
    syncChannelUserPermission: [ChannelUserPermission]
    getChannelUsersPermissions(channel_id: ID!): [UserProfileWithPermissions]
    getChannelUserPermission(
      user_id: ID!
      channel_id: ID!
    ): UserProfileWithPermissions
  }

  type Mutation {
    createChannelUserPermission(
      user_id: ID!
      channel_id: ID!
      permissions: String
    ): [UserProfileWithPermissions]
    updateChannelUserPermission(
      user_id: ID!
      channel_id: ID!
      permissions: String
    ): UserProfileWithPermissions
    deleteChannelUserPermission(
      user_id: ID!
      channel_id: ID!
    ): [UserProfileWithPermissions]
  }
`;

export default { API: [gqlTypes, gqlAPI] };
