import { gql } from "apollo-server-express";

const typeDefs = gql`
  type CategoryPermission {
    id: ID!
    channel_id: ID!
    server_role_id: ID
    user_id: ID
    is_user: Boolean!
    allow: String!
    deny: String!
  }

  input CreateCategoryPermissionInput {
    server_role_id: ID
    user_id: ID
    is_user: Boolean!
    allow: String!
    deny: String!
  }

  input UpdateCategoryPermissionInput {
    allow: String
    deny: String
  }

  extend type Query {
    getCategoryPermissions(Category_id: ID!): [CategoryPermission]
  }

  extend type Mutation {
    createCategoryPermission(
      Category_id: ID!
      input: CreateCategoryPermissionInput!
    ): CategoryPermission

    updateCategoryPermission(
      permission_id: ID!
      input: UpdateCategoryPermissionInput!
    ): CategoryPermission

    deleteCategoryPermission(id: ID!): Boolean
  }
`;

export default typeDefs;
