import { gql } from "apollo-server-express";

export default gql`
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
  
  extend type Query {
    getRelationshipType(user_first_id: ID!, user_second_id: ID!): RelationshipType
  }
  
  extend type Mutation {
      createRelationship(user_first_id: ID!, user_second_id: ID!, type: RelationshipType!): Relationship
      updateRelationship(user_first_id: ID!, user_second_id: ID!, type: RelationshipType!): Relationship
      deleteRelationship(user_first_id: ID!, user_second_id: ID!): Relationship
  }
`;
