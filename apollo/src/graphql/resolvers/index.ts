import { mergeResolvers } from '@graphql-tools/merge';

import userResolver from './user';
import relationshipResolver from './relationship';
import { userStatusResolvers_API, userStatusResolvers_Ws } from './user_status';
import userSettingsResolvers from './userSettings';
import { userProfileApollo, userProfileWs } from './user_profile';
import serverResolver from './server';
import serverEmoji from './serverEmoji';
import { dummyResolver_Ws } from './dummy';
import serverMemberResolver from './server_member';

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
]);

export const wsResolvers = mergeResolvers([
  dummyResolver_Ws,
  userStatusResolvers_Ws,
  serverResolver.Ws,
  userProfileWs,
]);
