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
    server_id: ID!
    is_private: Boolean
  }

  input updateCategoryInput {
    name: String
    position: Int
    is_private: Boolean
  }

  extend type Query {
    getCategory(category_id: ID!): Category
    getCategories(server_id: ID!): [Category]
  }

  extend type Mutation {
    createCategory(input: createCategoryInput!): Category
    updateCategory(category_id: ID!, input: updateCategoryInput!): Category
    deleteCategory(category_id: ID!): Category

    addPrivateCategoryID(category_id: ID!, id: ID!, is_user: Boolean): Category
    removePrivateCategoryID(
      category_id: ID!
      id: ID!
      is_user: Boolean
    ): Category
  }
`;
