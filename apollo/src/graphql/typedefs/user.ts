import { gql } from 'apollo-server-express';

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
    }

    extend type Mutation {
        createUser(input: CreateUserInput!): User!
    }

    input CreateUserInput {
        name: String!
        username: String!
        email: String!
        password: String!
    }
`;