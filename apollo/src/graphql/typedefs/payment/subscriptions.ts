import { gql } from "apollo-server-express";

const gqlTypes = gql`
  type UserSubscription {
    user_id: ID!
    package_id: ID

    package_: Package

    is_active: Boolean!
    startDate: String
    endDate: String
  }
`;

const gqlAPI = gql`
  extend type Query {
    userSubscription(user_id: ID!): UserSubscription
  }

  extend type Mutation {
    updateUserSubscription(
      user_id: ID!
      package_id: ID
      is_active: Boolean
      startDate: String
      endDate: String
    ): UserSubscription!
    updateUserPackageSubscription(
      user_id: ID!
      package_id: ID
    ): UserSubscription!

    syncUserSubscription(confirm: Boolean!): Boolean!
  }
`;

const API = [gqlTypes, gqlAPI];

export default { API };
