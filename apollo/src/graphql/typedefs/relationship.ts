import { gql } from "apollo-server-express";

const gqlType = gql`
  type Relationship {
    _id: IDPair
    type: RelationshipType
    created_at: String
    last_modified: String
  }

  type IDPair {
    user_first_id: ID
    user_second_id: ID
  }

  enum RelationshipType {
    PENDING_FIRST_SECOND
    PENDING_SECOND_FIRST
    FRIEND
    BLOCK_FIRST_SECOND
    BLOCK_SECOND_FIRST
  }
`;

const gqlApollo = gql`
  extend type Query {
    getRelationshipType(user_first_id: ID!, user_second_id: ID!): RelationshipType
    getAllFriends(user_id: ID!): [UserProfile]
    getReceivedFriendRequests(user_id: ID!): [UserProfile]
    getSentFriendRequests(user_id: ID!): [UserProfile]
    getBlockedUsers(user_id: ID!): [UserProfile]
  }

  extend type Mutation {
    createRelationship(user_first_id: ID!, user_second_id: ID!, type: RelationshipType!): Relationship
    updateRelationship(user_first_id: ID!, user_second_id: ID!, type: RelationshipType!): Relationship
    deleteRelationship(user_first_id: ID!, user_second_id: ID!): Relationship
  }
`;

const gqlWs = gql`
  extend type Subscription {
    friendListChanged(user_id: ID!): Relationship
  }
`;

export const apolloTypedefs = [gqlType, gqlApollo];
export const wsTypedefs = [gqlType, gqlWs];