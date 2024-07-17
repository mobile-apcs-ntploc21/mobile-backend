import { gql } from 'apollo-server-express';

export default gql`
  type Server {
    _id: ID!
    owner: User!
    name: String!
    photo_url: String!
    background_url: String!
    invite_code: String!
    total_members: Int!
    total_emojis: Int!
  }

  extend type Query {
    getServerById(serverId: ID!): Server
    getServersByUserId(userId: ID!): [Server]
  }

  extend type Mutation {
    createServer(ownerId: ID!, name: String!): Server
    updateServer(serverId: ID!, name: String, photo_url: String, background_url: String): Server
    deleteServer(serverId: ID!): Server
  }
`;