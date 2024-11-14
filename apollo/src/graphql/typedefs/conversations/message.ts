import { gql } from "apollo-server-express";

const gqlType = gql`
  enum AttachmentType {
    IMAGE
    VIDEO
    FILE
    AUDIO
  }

  type MessageAttachment {
    type: AttachmentType!
    url: String!
    filename: String
  }

  type MessageReaction {
    emoji_id: ID!
    count: Int!
    reactors: [ID!]
  }

  type Message {
    id: ID!

    conversation_id: ID!
    sender_id: ID!
    author: UserProfileLite

    content: String!
    replied_message_id: ID
    forwarded_message_id: ID

    mention_users: [ID]
    mention_roles: [ID]
    mention_channels: [ID]
    emojis: [ID]
    reactions: [MessageReaction]
    replied_message: Message

    is_deleted: Boolean
    is_pinned: Boolean
    is_modified: Boolean

    createdAt: DateTime
  }
`;

const gqlQuery = gql`
  input SearchQuery {
    inChannel: [ID]
    inConversation: [ID]
    text: String
    from: [ID]
    mention: [ID]
    has: AttachmentType
  }

  extend type Query {
    # Get a message by ID
    message(message_id: ID!): Message

    # Get all messages, given limit, before, after, or around a message
    # before: Get messages before a message
    # after: Get messages after a message
    # around: Get messages around a message (middle)
    messages(
      conversation_id: ID!

      before: ID
      after: ID
      around: ID

      limit: Int! = 30
    ): [Message]

    # Get all messages given a search query
    # If server_id is provided, search will be limited to that server. Else "in" field must be provided
    # in: Get messages in a conversation
    # from: Get messages sent by some given users
    # mention: Get messages that mention some given users
    # has: Get messages that have attachments (IMAGE, VIDEO, FILE)
    searchMessages(
      query: SearchQuery!

      offset: Int = 0
      limit: Int! = 30
    ): [Message]

    # Get all pinned messages in a conversation
    pinnedMessages(conversation_id: ID!): [Message]
  }
`;

const gqlMutation = gql`
  # Add a message to a conversation
  input AddMessageInput {
    sender_id: ID!
    content: String!

    mention_users: [ID]!
    mention_roles: [ID]!
    mention_channels: [ID]!
    emojis: [ID]!

    replied_message_id: ID
    forwarded_message_id: ID
  }

  input EditMessageInput {
    content: String!

    mention_users: [ID]!
    mention_roles: [ID]!
    mention_channels: [ID]!
    emojis: [ID]!
  }

  extend type Mutation {
    # Create a message
    createMessage(conversation_id: ID!, input: AddMessageInput!): Message

    # Edit a message
    editMessage(message_id: ID!, input: EditMessageInput): Message

    # Delete a message
    deleteMessage(message_id: ID!): Boolean

    # Pin a message
    pinMessage(message_id: ID!): [Message]

    # Unpin a message
    unpinMessage(message_id: ID!): [Message]
  }
`;

const API = [gqlType, gqlQuery, gqlMutation];

export default { API, type: gqlType };
