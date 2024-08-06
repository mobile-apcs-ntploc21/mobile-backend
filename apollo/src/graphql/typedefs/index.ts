import { gql } from "apollo-server-express";
import { mergeTypeDefs } from "@graphql-tools/merge";

import userSchema from "./user";
import relationshipSchema from "./relationship";
import { userStatusSchema_API, userStatusSchema_Ws } from "./user_status";
import serverSchema from "./server";
import serverMemberSchema from "./server_member";
import userSettingsSchema from "./userSettings";
import {
  apolloTypedefs as userProfileApollo,
  wsTypedefs as userProfileWs,
} from "./user_profile";
import serverEmoji from "./serverEmoji";
import channel from "./Channel/channel";

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
  userSettingsSchema,
  userProfileApollo,
  serverMemberSchema.API,
  serverSchema.API,
  serverEmoji.API,
  channel.API,
]);

export const wsTypeDefs = mergeTypeDefs([
  linkedSchema,
  userStatusSchema_Ws,
  serverSchema.Ws,
  userProfileWs,
  channel.WS,
]);
