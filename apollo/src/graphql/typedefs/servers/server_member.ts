import { gql } from "apollo-server-express";

const gqlTypes = gql`
  type ServerMember {
    server_id: ID!
    user_id: ID!
  }

  type ServerProfile {
    id: ID!
    user_id: ID!
    display_name: String
    username: String
    about_me: String
    avatar_url: String
    banner_url: String
    status: UserStatus!
    roleIds: [ID!]!
  }
`;

const gqlAPI = gql`
  input ServerMembersInput {
    server_id: ID!
    user_ids: [ID!]!
  }

  extend type Query {
    getServerMembers(server_id: ID!, limit: Int): [ServerProfile]
    checkServerMember(server_id: ID!, user_id: ID!): Boolean
  }

  extend type Mutation {
    joinServer(url: String!, user_id: ID!): ServerMember
    addServerMembers(input: ServerMembersInput!): [ServerMember]
    removeServerMembers(input: ServerMembersInput!): [ServerMember]
  }
`;

export default { API: [gqlTypes, gqlAPI] };
