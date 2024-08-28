import { gql } from "apollo-server-express";

const gqlTypes = gql`
  type Server {
    id: ID
    owner: ID
    name: String

    avatar_url: String
    banner_url: String
    invite_code: [InviteCode]
    totalMembers: Int
    totalEmojis: Int

    is_favorite: Boolean
    position: Int

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
    owner_id: ID!
    name: String!
    avatar_url: String
    banner_url: String
  }

  input UpdateServerInput {
    name: String
    avatar_url: String
    banner_url: String
  }

  input CreateInviteCodeInput {
    url: String!
    expiredAt: String
    maxUses: Int!
  }

  input MoveServerInput {
    server_id: ID!
    position: Int!
  }

  extend type Query {
    server(server_id: ID!): Server
    servers(user_id: ID!): [Server!]

    getInviteCode(server_id: ID!): [InviteCode]
  }

  extend type Mutation {
    createServer(input: CreateServerInput!): Server!
    updateServer(server_id: ID!, input: UpdateServerInput!): Server!
    deleteServer(server_id: ID!): Boolean
    transferOwnership(server_id: ID!, user_id: ID!): Boolean

    createInviteCode(server_id: ID!, input: CreateInviteCodeInput!): InviteCode!
    deleteInviteCode(server_id: ID!, url: String!): Boolean

    setFavoriteServer(
      user_id: ID!
      server_id: ID!
      is_favorite: Boolean
    ): Boolean
    moveServer(user_id: ID!, input: [MoveServerInput!]!): Boolean
  }
`;

const gqlWs = gql`
  scalar JSON

  type ServerUpdate {
    server_id: ID!
    type: String!
    data: JSON
  }

  extend type Subscription {
    serverUpdated(server_id: ID!): ServerUpdate
  }
`;

const API = [gqlTypes, gqlAPI];
const Ws = [gqlTypes, gqlWs];
export default { API, Ws };
