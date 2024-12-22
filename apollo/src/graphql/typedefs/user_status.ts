import { gql } from "apollo-server-express";

import DateTime from "../scalars/DateTime";

const gqlType = gql`
  scalar DateTime

  enum CustomStatus {
    ONLINE
    IDLE
    DO_NOT_DISTURB
    INVISIBLE
    OFFLINE
  }

  type UserStatus {
    user_id: ID!
    type: CustomStatus!
    last_seen: DateTime!
    status_text: String
    is_online: Boolean!
  }
`;

const gqlApollo = gql`
  extend type Query {
    getUserStatus(user_id: ID!): UserStatus
    getMultipleUserStatus(user_ids: [ID!]!): [UserStatus]
  }

  extend type Mutation {
    syncUsers: String
    updateStatusType(user_id: ID!, type: CustomStatus!): UserStatus
    updateStatusText(
      user_id: ID!
      status_text: String!
      expire_date: String
    ): UserStatus
  }
`;

const gqlWs = gql`
  extend type Subscription {
    userStatusChanged(user_id: ID!): UserStatus
  }
`;

export const userStatusSchema_API = [gqlType, gqlApollo];
export const userStatusSchema_Ws = [gqlType, gqlWs];
