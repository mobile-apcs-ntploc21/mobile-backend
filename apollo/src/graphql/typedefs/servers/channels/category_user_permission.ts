import { gql } from "apollo-server-express";

const gqlTypes = gql`
  type CategoryUserPermission {
    _id: IDPair
    permissions: String
  }
  
  type IDPair {
    user_id: ID
    category_id: ID
  }
`;

const gqlAPI = gql`
  type Query {
    syncCategoryUserPermission: [CategoryUserPermission]
    getCategoryUserPermission(user_id: ID!, category_id: ID!): CategoryUserPermission
  }

  type Mutation {
    createCategoryUserPermission(user_id: ID!, category_id: ID!, permissions: String): CategoryUserPermission
    updateCategoryUserPermission(user_id: ID!, category_id: ID!, permissions: String): CategoryUserPermission
    deleteCategoryUserPermission(user_id: ID!, category_id: ID!): CategoryUserPermission
  }
`;

export default { API: [gqlTypes, gqlAPI] };
