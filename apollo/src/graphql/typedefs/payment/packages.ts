import { gql } from "apollo-server-express";

const gqlTypes = gql`
  scalar DateTime

  type SaleDetails {
    discount: Float!
    end_date: DateTime
  }

  type Package {
    id: ID!
    name: String!
    description: String!
    base_price: Float!
    is_on_sale: Boolean!
    sale_details: SaleDetails
    duration: Int!
    features_list: JSON
  }
`;

const gqlAPI = gql`
  extend type Query {
    packages: [Package]
    package(id: ID!): Package
  }

  extend type Mutation {
    createPackage(
      name: String!
      description: String!
      base_price: Float!
      is_on_sale: Boolean!
      sale_details: JSON
      duration: Int!
      features_list: JSON
    ): Package
    updatePackage(
      id: ID!
      name: String
      description: String
      base_price: Float
      is_on_sale: Boolean
      sale_details: JSON
      duration: Int
      features_list: JSON
    ): Package
    deletePackage(id: ID!): Package
  }
`;

const API = [gqlTypes, gqlAPI];

export default { API };
