import { gql } from "apollo-server-express";

const gqlTypes = gql`
  type Emoji {
    id: ID!
    name: String!
    image_url: String
    type: String!
    unicode: String
    category: String
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

  # Output for the query of a list of [{ServerName/Category: [Emoji]}]
  type EmojiGroup {
    name: String!
    server_id: ID
    emojis: [Emoji]
  }

  extend type Query {
    # Use to get the server emojis
    serverEmoji(server_id: ID!, emoji_id: ID!): Emoji
    serverEmojis(server_id: ID!): [Emoji]
    countServerEmojis(server_id: ID!): Int!

    serversEmojis(user_id: ID!): [EmojiGroup]

    # Use to get Unicode emojis
    unicodeEmojis(confirm: Boolean): [EmojiGroup]
  }

  # Mainly use for server emojis
  extend type Mutation {
    createServerEmoji(input: CreateEmojiInput!): Emoji!
    updateServerEmoji(emoji_id: ID!, name: String!): Emoji!
    deleteServerEmoji(emoji_id: ID!): Boolean
    hardDeleteServerEmoji(emoji_id: ID!): Boolean

    # Use to upload Unicode emoji onto the database, only ran this once.
    syncUnicodeEmoji(confirm: Boolean): Boolean

    # Use to sync server emojis to the unified database
    syncServerEmojis(confirm: Boolean): Boolean
  }
`;

const API = [gqlTypes, gqlAPI];
export default { API };
