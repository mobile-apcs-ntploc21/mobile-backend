import { gql } from "apollo-server-express";
import { mergeTypeDefs } from "@graphql-tools/merge";

import userSchema from "./user";
import relationshipSchema from "./relationship";
import { userStatusSchema_API, userStatusSchema_Ws } from "./user_status";
import serverSchema from "./server";

const linkedSchema = gql`
  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
  type Subscription {
    _: Boolean
  }
`;

// Merge all typeDefs: Add more in the future if needed
// e.g [userSchema, postSchema, channelSchema]
export const apiTypeDefs = mergeTypeDefs([
  linkedSchema,
  userSchema,
  relationshipSchema,
  userStatusSchema_API,
  serverSchema.API,
]);

export const wsTypeDefs = mergeTypeDefs([
  linkedSchema,
  userStatusSchema_Ws,
  serverSchema.Ws,
]);
