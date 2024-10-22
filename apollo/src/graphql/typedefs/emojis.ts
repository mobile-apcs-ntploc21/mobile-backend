import { gql } from "apollo-server-express";

const gqlTypes = gql`
  type Emoji {
    id: ID!
    name: String!
    image_url: String
    type: String!
    unicode: String
    is_deleted: Boolean
    server_id: ID
    uploader_id: ID
  }
`;

const gqlAPI = gql`
  # Mainly for server emojis input
  input CreateEmojiInput {
    name: String!
    image_url: String!
    server_id: ID!
    uploader_id: ID!
  }

  extend type Query {
    # Use to get the server emojis
    Emoji(server_id: ID!, emoji_id: ID!): Emoji
    Emoji(server_id: ID!): Emoji

    # Use to get Unicode emojis
    Emoji(): Emoji
    Emoji(unicode: String): Emoji
  }

  # Mainly use for server emojis
  extend type Mutation {
    createServerEmoji(input: CreateEmojiInput!): Emoji!
    uploadServerEmoji(emoji_id: ID!, name: String!): ServerEmoji!
    deleteServerEmoji(emoji_id: ID!): Boolean
    hardDeleteServerEmoji(emoji_id: ID!): Boolean
  }
`;

const API = [gqlTypes, gqlAPI];
export default { API };
