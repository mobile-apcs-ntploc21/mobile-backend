import { gql } from "apollo-server-express";

const gqlTypes = gql`
  type Category {
    id: ID

    server_id: ID
    name: String
    position: Int
  }
`;

const gqlAPI = gql`
  input createCategoryInput {
    name: String!
    is_private: Boolean
  }

  input updateCategoryInput {
    name: String
  }

  input moveAllCategoryInput {
    category_id: ID!
    position: Int!
  }

  extend type Query {
    getCategory(category_id: ID!): Category
    getCategories(server_id: ID!): [Category]
  }

  extend type Mutation {
    createCategory(server_id: ID!, input: createCategoryInput!): Category
    updateCategory(category_id: ID!, input: updateCategoryInput!): Category
    deleteCategory(category_id: ID!): Boolean

    moveCategory(category_id: ID!, new_position: Int!): Category
    moveAllCategory(server_id: ID!, input: [moveAllCategoryInput!]!): [Category]
  }
`;

const API = [gqlTypes, gqlAPI];

export default { API };
