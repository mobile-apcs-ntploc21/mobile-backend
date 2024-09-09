import { gql } from "apollo-server-express";
import { mergeTypeDefs } from "@graphql-tools/merge";

/// User
import userSchema from "./user";
import {
  apolloTypedefs as relationshipApollo,
  wsTypedefs as relationshipWs,
} from "./relationship";
import { userStatusSchema_API, userStatusSchema_Ws } from "./user_status";
import userSettingsSchema from "./userSettings";
import {
  apolloTypedefs as userProfileApollo,
  wsTypedefs as userProfileWs,
} from "./user_profile";
/// Server
import serverBans from "./servers/server_bans";
import serverSchema from "./servers/server";
import serverMemberSchema from "./servers/server_member";
import serverEmoji from "./servers/serverEmoji";
import server_role from "./servers/server_role";
import assigned_user_role from "./servers/assigned_user_role";
/// Channel
import channel from "./servers/channels/channel";
import category from "./servers/channels/category";
import channel_role_permission from "./servers/channels/channel_role_permission";
import channel_user_permission from "./servers/channels/channel_user_permission";
import category_role_permission from "./servers/channels/category_role_permission";
import category_user_permission from "./servers/channels/category_user_permission";
/// Conversation
import message from "./conversations/message";
import reaction from "./conversations/reaction";

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
  server_role.API,
  assigned_user_role.API,

  channel.API,
  category.API,
  channel_role_permission.API,
  channel_user_permission.API,
  category_role_permission.API,
  category_user_permission.API,

  message.API,
  reaction.API,
]);

export const wsTypeDefs = mergeTypeDefs([
  linkedSchema,
  userStatusSchema_Ws,
  userProfileWs,
  relationshipWs,

  serverSchema.Ws,

  channel.WS,
]);
