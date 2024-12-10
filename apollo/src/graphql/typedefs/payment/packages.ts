import { gql } from "apollo-server-express";

const gqlTypes = gql`
  type Package {
    id: ID!
    name: String!
    price: Int!
    description: String!
    image: String!
    type: String!
    status: String!
  }
`;

const gqlAPI = gql`
  extend type Query {
    packages: [Package]
  }

  extend type Mutation {
    createPackage(
      name: String!
      price: Int!
      description: String!
      image: String!
      type: String!
      status: String!
    ): Package!
    updatePackage(
      id: ID!
      name: String
      price: Int
      description: String
      image: String
      type: String
      status: String
    ): Package!
  }
`;
