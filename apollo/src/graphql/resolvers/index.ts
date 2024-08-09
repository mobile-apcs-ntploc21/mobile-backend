import { mergeResolvers } from "@graphql-tools/merge";

import { dummyResolver_Ws } from "./dummy";
/// User
import userResolver from "./user";
import relationshipResolver from "./relationship";
import { userStatusResolvers_API, userStatusResolvers_Ws } from "./user_status";
import userSettingsResolvers from "./userSettings";
import { userProfileApollo, userProfileWs } from "./user_profile";
/// Server
import serverResolver from "./server";
import serverEmoji from "./serverEmoji";
import serverMemberResolver from "./server_member";
import serverBansResolver from "./server_bans";

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
  serverBansResolver,
]);

export const wsResolvers = mergeResolvers([
  dummyResolver_Ws,
  userStatusResolvers_Ws,
  userProfileWs,
  serverResolver.Ws,
]);
