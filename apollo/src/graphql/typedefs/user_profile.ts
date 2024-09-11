import { gql } from "apollo-server-express";

const gqlType = gql`
  scalar ObjectId

  type UserProfile {
    id: ID!
    user_id: ID!
    server_id: ID
    display_name: String
    username: String!
    about_me: String!
    avatar_url: String
    banner_url: String
    status: ID
  }

  type UserProfileLite {
    id: ID
    user_id: ID
    display_name: String
    username: String
    avatar_url: String
  }

  input UserProfileInput {
    user_id: ID!
    server_id: ID
    display_name: String
    about_me: String
    avatar_url: String
    banner_url: String
    status: ID
  }
`;

const gqlApollo = gql`
  extend type Query {
    syncUserProfile: [UserProfile]
    getUserProfile(user_id: ID!, server_id: ID): UserProfile
    getUserProfileByUsername(username: String!): UserProfile
  }

  extend type Mutation {
    createUserProfile(input: UserProfileInput!): UserProfile
    updateUserProfile(input: UserProfileInput!): UserProfile
    deleteUserProfile(user_id: ID!, server_id: ID): UserProfile
  }
`;

const gqlWs = gql`
  type Subscription {
    userProfileUpdated(user_id: ID!, server_id: ID): UserProfile
  }
`;

export const apolloTypedefs = [gqlType, gqlApollo];
export const wsTypedefs = [gqlType, gqlWs];
