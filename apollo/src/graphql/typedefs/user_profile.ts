import { gql } from "apollo-server-express";

const typeDefs = gql`
  scalar ObjectId

  type UserProfile {
    id: ID!
    user_id: ObjectId!
    server_id: ObjectId
    display_name: String
    username: String!
    about_me: String!
    avatar_url: String
    banner_url: String
    status: ObjectId
  }

  extend type Query {
    getUserProfile(user_id: ID!, server_id: ID): UserProfile
  }

  extend type Mutation {
    createUserProfile(
      user_id: ID!
      server_id: ID
      display_name: String
      about_me: String!
      avatar_url: String
      banner_url: String
      status: ID
    ): UserProfile

    updateUserProfile(
      user_id: ID!
      server_id: ID
      display_name: String
      about_me: String
    ): UserProfile

    updateUserProfileAvatar(
      user_id: ID!
      server_id: ID
      file: Upload!
    ): UserProfile

    updateUserProfileBanner(
      user_id: ID!
      server_id: ID
      file: Upload!
    ): UserProfile

    deleteUserProfile(user_id: ID!, server_id: ID): UserProfile
  }
`;

export default typeDefs;
