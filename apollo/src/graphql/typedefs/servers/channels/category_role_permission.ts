import { gql } from "apollo-server-express";

const gqlTypes = gql`
  type CategoryRolePermission {
    _id: IDPair
    permissions: String
  }

  type IDPair {
    server_role_id: ID
    category_id: ID
  }
`;

const gqlAPI = gql`
  type Query {
    syncCategoryRolePermission: [CategoryRolePermission]
    getCategoryRolesPermissions(category_id: ID!): [ServerRole]
    getCategoryRolePermission(role_id: ID!, category_id: ID!): ServerRole
  }

  type Mutation {
    createCategoryRolePermission(
      role_id: ID!
      category_id: ID!
      permissions: String
    ): [ServerRole]
    updateCategoryRolePermission(
      role_id: ID!
      category_id: ID!
      permissions: String
    ): ServerRole
    deleteCategoryRolePermission(role_id: ID!, category_id: ID!): [ServerRole]
  }
`;

export default { API: [gqlTypes, gqlAPI] };
