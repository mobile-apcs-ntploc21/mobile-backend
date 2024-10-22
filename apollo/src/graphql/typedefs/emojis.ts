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
    serverEmoji(server_id: ID!, emoji_id: ID!): Emoji
    serverEmojis(server_id: ID!): [Emoji]
    countNumberEmojis(server_id: ID!): Int!

    # Use to get Unicode emojis
    unicodeEmoji(): Emoji
    unicodeEmoji(unicode: String): Emoji
  }

  # Mainly use for server emojis
  extend type Mutation {
    createServerEmoji(input: CreateEmojiInput!): Emoji!
    updateServerEmoji(emoji_id: ID!, name: String!): Emoji!
    deleteServerEmoji(emoji_id: ID!): Boolean
    hardDeleteServerEmoji(emoji_id: ID!): Boolean

    # Use to upload Unicode emoji onto the database, only ran this once.
    syncUnicodeEmoji(): Boolean
  }
`;

const API = [gqlTypes, gqlAPI];
export default { API };
