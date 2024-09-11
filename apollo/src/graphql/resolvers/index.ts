import { mergeResolvers } from "@graphql-tools/merge";

import { dummyResolver_Ws } from "./dummy";
/// User
import userResolver from "./user";
import relationshipResolver from "./relationship";
import { userStatusResolvers_API, userStatusResolvers_Ws } from "./user_status";
import userSettingsResolvers from "./userSettings";
import { userProfileApollo, userProfileWs } from "./user_profile";
/// Server
import serverResolver from "./servers/server";
import serverEmoji from "./servers/serverEmoji";
import serverMemberResolver from "./servers/server_member";
import serverBansResolver from "./servers/server_bans";
/// Channel
import channelResolver from "./servers/channels/channel";
import categoryResolver from "./servers/channels/category";
import server_role from "./servers/server_role";
import assigned_user_role from "./servers/assigned_user_role";
import channel_role_permission from "./servers/channels/channel_role_permission";
import channel_user_permission from "./servers/channels/channel_user_permission";
import category_role_permission from "./servers/channels/category_role_permission";
import category_user_permission from "./servers/channels/category_user_permission";
/// Conversation
import messageResolver from "./conversations/message";
import reactionResolver from "./conversations/reaction";
import lastReadResolver from "./conversations/last_read";

// Merge all resolvers: Add more in the future if needed
// e.g [userResolver, postResolver, channelResolver]
export const apiResolvers = mergeResolvers([
  userResolver,
  relationshipResolver.API,
  userProfileApollo,
  userSettingsResolvers,
  userStatusResolvers_API,

  messageResolver.API,
  reactionResolver.API,
  lastReadResolver,

  serverResolver.API,
  serverMemberResolver.API,
  serverEmoji.API,
  serverBansResolver,
  server_role.API,

  assigned_user_role.API,
  channelResolver.API,
  categoryResolver,
  channel_role_permission.API,
  channel_user_permission.API,
  category_role_permission.API,
  category_user_permission.API,
]);

export const wsResolvers = mergeResolvers([
  dummyResolver_Ws,
  userStatusResolvers_Ws,
  userProfileWs,
  serverResolver.Ws,
]);
