import { gql } from "apollo-server-express";

const gqlTypes = gql`
  type CategoryUserPermission {
    _id: IDPair
    permissions: String
  }
  
  type UserProfileWithPermissions {
    id: ID!
    display_name: String
    username: String!
    about_me: String!
    avatar_url: String
    banner_url: String
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
    getCategoryUsersPermissions(category_id: ID!): [UserProfileWithPermissions]
    getCategoryUserPermission(user_id: ID!, category_id: ID!): UserProfileWithPermissions
  }

  type Mutation {
    createCategoryUserPermission(user_id: ID!, category_id: ID!, permissions: String): [UserProfileWithPermissions]
    updateCategoryUserPermission(user_id: ID!, category_id: ID!, permissions: String): UserProfileWithPermissions
    deleteCategoryUserPermission(user_id: ID!, category_id: ID!): [UserProfileWithPermissions]
  }
`;

export default { API: [gqlTypes, gqlAPI] };
