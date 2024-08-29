import { gql } from 'apollo-server-express';

// const gqlTypes = gql`
//
// `;

const gqlAPI = gql`
  extend type Query {
    getRolesAssignedWithUser(user_id: ID!, server_id: ID!): [ServerRole]
    getUsersAssignedWithRole(role_id: ID!): [UserProfile]
    checkUserHasRole(role_id: ID!, user_id: ID!): Boolean
  }

  extend type Mutation {
    addUserToRole(role_id: ID!, user_id: ID!): [UserProfile]
    removeUserFromRole(role_id: ID!, user_id: ID!): [UserProfile]
  }
`;

export default { API: [gqlAPI] };
