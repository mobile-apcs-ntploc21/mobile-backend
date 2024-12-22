import { gql } from "apollo-server-express";

const gqlTypes = gql`
  type ExpirableObject {
    object_id: ID!
    expire_date: String!
  }

  type ExpireDate {
    type: String!
    object: ExpirableObject!
  }
`;

const gqlAPI = gql`
  extend type Query {
    expireDate(id: ID!): ExpireDate
  }

  extend type Mutation {
    setExpireDate(
      type: String!
      object_id: ID!
      expire_date: String!
    ): ExpireDate
  }
`;

const API = [gqlTypes, gqlAPI];
export default { API };
