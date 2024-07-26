import { gql } from "apollo-server-express";

export default gql`
  type User {
    id: ID
    username: String!
    email: String!
    phone_number: String
    created_at: String
    last_modified: String
    verified: Boolean
    age: Int
  }

  extend type Query {
    me: User
    users: [User!]
    isLoggedIn: Boolean!

    loginUser(email: String!, password: String!): User
    logoutUser(refresh_token: String, id: ID!): Boolean
    getUserById(id: ID!): User
    getUserByEmail(email: String!): User
    getUserByUsername(username: String!): User
  }

  extend type Mutation {
    createUser(input: CreateUserInput!): User!
    updateRefreshToken(input: UpdateRefreshTokenInput!): User!
  }

  input CreateUserInput {
    name: String!
    username: String!
    email: String!
    password: String!
    phone_number: String
    age: Int
  }

  input UpdateRefreshTokenInput {
    email: String!
    old_token: String
    token: String!
  }
`;
