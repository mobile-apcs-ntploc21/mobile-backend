import { gql } from "apollo-server-express";

export default gql`
  type User {
    _id: ID!
    username: String!
    email: String!
  }

  type UserSettings {
    _id: ID!
    user_id: ID!
    user: User
    settings: String
    createdAt: String
    updatedAt: String
  }

  input CreateUserSettingsInput {
    user_id: ID!
    settings: String
  }

  input UpdateUserSettingsInput {
    user_id: ID!
    settings: String
  }

  type Query {
    syncUserSettings: [UserSettings]
    getUserSettings(user_id: ID!): UserSettings
  }

  type Mutation {
    createUserSettings(input: CreateUserSettingsInput!): UserSettings
    updateUserSettings(input: UpdateUserSettingsInput!): UserSettings
    deleteUserSettings(user_id: ID!): UserSettings
    restoreUserSettings(user_id: ID!): UserSettings
  }
`;
