import { gql } from "apollo-server-express";

const gqlTypes = gql`
  type Server {
    _id: ID!
    ownerId: ID!
    name: String!
    photoUrl: String
    bannerUrl: String
    inviteCode: [InviteCode]
    totalMembers: Int
    totalEmojis: Int
    createdAt: String
    updatedAt: String
  }

  type InviteCode {
    url: String!
    expiredAt: String
    maxUses: Int!
    currentUses: Int!
  }
`;

const gqlAPI = gql`
  input CreateServerInput {
    ownerId: ID!
    name: String!
    photoUrl: String
    bannerUrl: String
  }

  input UpdateServerInput {
    name: String
    photoUrl: String
    bannerUrl: String
  }

  input CreateInviteCodeInput {
    url: String!
    expiredAt: String
    maxUses: Int!
  }

  extend type Query {
    server(server_id: ID!): Server
    servers(user_id: ID!): [Server!]
  }

  extend type Mutation {
    createServer(input: CreateServerInput!): Server!
    updateServer(server_id: ID!, input: UpdateServerInput!): Server!
    deleteServer(server_id: ID!): Boolean

    createInviteCode(server_id: ID!, input: CreateInviteCodeInput!): InviteCode!
    deleteInviteCode(server_id: ID!, url: String!): Boolean
  }
`;

const gqlWs = gql`
  union ServerUpdatePayload =
      UserPresenceUpdate
    | MemberUpdate
    | ServerSettingsUpdate

  type UserPresenceUpdate {
    user_id: ID!
    status: String!
  }

  type UserUpdate {
    server_id: ID!
    profile: UserProfile!
  }

  type ServerSettingsUpdate {
    server_id: ID!
    settings: ServerSettings!
  }

  type UserProfile {
    display_name: String!
    photo_url: String
    banner_url: String
    about_me: String
  }

  type ServerSettings {
    name: String!
    photo_url: String
    banner_url: String
    invite_code: [InviteCode]
  }

  type ServerUpdatePayload {
    type: String!
    payload: ServerUpdatePayload
  }

  type ServerUpdate {
    server_id: ID!
    type: String!
    payload: ServerUpdatePayload!
  }

  extend type Subscription {
    serverUpdated(server_id: ID!): Server
  }
`;
