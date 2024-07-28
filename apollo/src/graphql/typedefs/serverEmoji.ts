import { gql } from "apollo-server-express";

const gqlTypes = gql`
  type ServerEmoji {
    id: ID!
    server_id: ID!
    name: String!
    image_url: String!
    uploader_id: ID!
    is_deleted: Boolean!
  }
`;

const gqlAPI = gql`
  input CreateServerEmojiInput {
    server_id: ID!
    name: String!
    image_url: String!
    uploader_id: ID!
  }

  extend type Query {
    serverEmoji(server_id: ID!, emoji_id: ID!): ServerEmoji
    serverEmojis(server_id: ID!): [ServerEmoji!]
  }

  extend type Mutation {
    createServerEmoji(input: CreateServerEmojiInput!): ServerEmoji!
    updateServerEmoji(emoji_id: ID!, name: String!): ServerEmoji!
    deleteServerEmoji(emoji_id: ID!): Boolean
    hardDeleteServerEmoji(emoji_id: ID!): Boolean
  }
`;

const API = [gqlTypes, gqlAPI];
export default { API };
