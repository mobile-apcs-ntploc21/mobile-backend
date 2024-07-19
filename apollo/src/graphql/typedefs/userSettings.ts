import { gql } from "apollo-server-express";

export default gql`
  type User {
    _id: ID!
    username: String!
    email: String!
  }

  type UserSettings {
    _id: ID!
    userId: ID!
    user: User
    settings: String
    createdAt: String
    updatedAt: String
  }

  input CreateUserSettingsInput {
    userId: ID!
    settings: String
  }

  input UpdateUserSettingsInput {
    userId: ID!
    settings: String
  }

  type Query {
    getUserSettings(userId: ID!): UserSettings
  }

  type Mutation {
    createUserSettings(input: CreateUserSettingsInput!): UserSettings
    updateUserSettings(input: UpdateUserSettingsInput!): UserSettings
    deleteUserSettings(userId: ID!): UserSettings
    restoreUserSettings(userId: ID!): UserSettings
  }
`;
