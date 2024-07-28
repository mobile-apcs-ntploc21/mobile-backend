import { gql } from "apollo-server-express";

const gqlTypes = gql`
  type ServerEmoji {
    id: ID!
    server_id: ID!
    name: String!
    image_url: String!
    uploader_id: ID!
    createdAt: String
    updatedAt: String
  }
`;

const gqlAPI = gql`
  input CreateServerEmojiInput {
    server_id: ID!
    name: String!
    image_url: String!
  }

  extend type Query {
    serverEmoji(server_id: ID!, emoji_id: ID!): ServerEmoji
    serverEmojis(server_id: ID!): [ServerEmoji!]
  }

  extend type Mutation {
    createServerEmoji(input: CreateServerEmojiInput!): ServerEmoji!
    updateServerEmoji(
      emoji_id: ID!
      name: String
      is_deleted: Boolean
    ): ServerEmoji!
    deleteServerEmoji(emoji_id: ID!): Boolean
  }
`;

const API = [gqlTypes, gqlAPI];
export default { API };
