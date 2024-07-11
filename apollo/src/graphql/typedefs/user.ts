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
    token: String
  }

  extend type Query {
    me: User
    users: [User!]
    isLoggedIn: Boolean!

    loginUser(email: String!, password: String!): User
    getUserById(id: ID!): User
    getUserByEmail(email: String!): User
  }

  extend type Mutation {
    createUser(input: CreateUserInput!): User!
  }

  input CreateUserInput {
    name: String!
    username: String!
    email: String!
    password: String!
    phone_number: String
    age: Int
  }
`;
