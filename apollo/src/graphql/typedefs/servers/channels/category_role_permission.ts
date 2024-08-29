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
    getCategoryRolePermission(role_id: ID!, category_id: ID!): CategoryRolePermission
  }

  type Mutation {
    createCategoryRolePermission(role_id: ID!, category_id: ID!, permissions: String): CategoryRolePermission
    updateCategoryRolePermission(role_id: ID!, category_id: ID!, permissions: String): CategoryRolePermission
    deleteCategoryRolePermission(role_id: ID!, category_id: ID!): CategoryRolePermission
  }
`;

export default { API: [gqlTypes, gqlAPI] };
