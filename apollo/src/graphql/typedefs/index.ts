import { gql } from "apollo-server-express";
import { mergeTypeDefs } from "@graphql-tools/merge";

import userSchema from "./user";
import userSettingsSchema from "./userSettings";
import relationshipSchema from "./relationship";
import {
  apolloTypedefs as userProfileApollo,
  wsTypedefs as userProfileWs,
} from "./user_profile";

const linkedSchema = gql`
  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
`;

// Merge all typeDefs: Add more in the future if needed
// e.g [userSchema, postSchema, channelSchema]
export const apolloTypedefs = mergeTypeDefs([
  linkedSchema,
  userSchema,
  userSettingsSchema,
  relationshipSchema,
  userProfileApollo,
]);

export const wsTypedefs = mergeTypeDefs([linkedSchema, userProfileWs]);
