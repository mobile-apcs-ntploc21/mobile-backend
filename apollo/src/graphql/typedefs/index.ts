import { gql } from "apollo-server-express";
import { mergeTypeDefs } from "@graphql-tools/merge";

/// User
import userSchema from "./user";
import relationshipSchema from "./relationship";
import { userStatusSchema_API, userStatusSchema_Ws } from "./user_status";
import userSettingsSchema from "./userSettings";
import {
  apolloTypedefs as userProfileApollo,
  wsTypedefs as userProfileWs,
} from "./user_profile";
/// Server
import serverSchema from "./server";
import serverMemberSchema from "./server_member";
import serverEmoji from "./serverEmoji";
import serverBans from "./server_bans";

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
  relationshipApollo,
  userStatusSchema_API,
  userSettingsSchema,
  userProfileApollo,

  serverMemberSchema.API,
  serverSchema.API,
  serverEmoji.API,
  serverBans.API,
]);

export const wsTypeDefs = mergeTypeDefs([
  linkedSchema,
  userStatusSchema_Ws,
  userProfileWs,
  serverSchema.Ws,
]);
