import { gql } from "apollo-server-express";

const gqlTypes = gql`
  type privateCategory {
    is_private: Boolean
    role_id: [ID]
    user_id: [ID]
  }

  type Category {
    id: ID

    server_id: ID
    name: String
    position: Int

    private: privateCategory
  }
`;

const gqlAPI = gql`
  input createCategoryInput {
    name: String!
    is_private: Boolean
  }

  input updateCategoryInput {
    name: String
    is_private: Boolean
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

    addPrivateCategoryID(category_id: ID!, id: ID!, is_user: Boolean): Category
    removePrivateCategoryID(
      category_id: ID!
      id: ID!
      is_user: Boolean
    ): Category
  }
`;

const API = [gqlTypes, gqlAPI];

export default { API };
