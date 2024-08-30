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
    getChannelUserPermission(user_id: ID!, channel_id: ID!): ChannelUserPermission
  }

  type Mutation {
    createChannelUserPermission(user_id: ID!, channel_id: ID!, permissions: String): ChannelUserPermission
    updateChannelUserPermission(user_id: ID!, channel_id: ID!, permissions: String): ChannelUserPermission
    deleteChannelUserPermission(user_id: ID!, channel_id: ID!): ChannelUserPermission
  }
`;

export default { API: [gqlTypes, gqlAPI] };
