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
/// Channel
import channelResolver from "./servers/channels/channel";
import categoryResolver from "./servers/channels/category";
import channelPermissionResolver from "./servers/channels/channel_permission";
import categoryPermissionResolver from "./servers/channels/category_permission";

// Merge all resolvers: Add more in the future if needed
// e.g [userResolver, postResolver, channelResolver]
export const apiResolvers = mergeResolvers([
  userResolver,
  relationshipResolver,
  userProfileApollo,
  userSettingsResolvers,
  userStatusResolvers_API,

  serverResolver.API,
  serverMemberResolver.API,
  serverEmoji.API,
  channelResolver.API,
  categoryResolver,
  channelPermissionResolver,
  categoryPermissionResolver,
]);

export const wsResolvers = mergeResolvers([
  dummyResolver_Ws,
  userStatusResolvers_Ws,
  serverResolver.Ws,
  userProfileWs,
]);
