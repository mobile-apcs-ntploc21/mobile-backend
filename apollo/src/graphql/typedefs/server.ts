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
`;

const gqlAPI = gql`
  extend type Query {
    server(id: ID!): Server
    servers(userId: ID!): [Server!]
  }

  extend type Mutation {
    createServer(input: CreateServerInput!): Server!
    updateServer(id: ID!, input: UpdateServerInput!): Server!
    deleteServer(id: ID!): Boolean
  }
`;

const gqlWs = gql`
  union ServerUpdatePayload =
      UserPresenceUpdate
    | MemberUpdate
    | ServerSettingsUpdate

  type UserPresenceUpdate {
    userId: ID!
    status: String!
  }

  type UserUpdate {
    serverId: ID!
    profile: UserProfile!
  }

  type ServerSettingsUpdate {
    serverId: ID!
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
    serverId: ID!
    type: String!
    payload: ServerUpdatePayload!
  }

  extend type Subscription {
    serverUpdated(id: ID!): Server
  }
`;
