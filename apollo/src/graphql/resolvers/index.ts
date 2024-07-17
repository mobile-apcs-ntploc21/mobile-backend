import { mergeResolvers } from '@graphql-tools/merge';

import userResolver from './user';
import relationshipResolver from './relationship';
import { userStatusResolvers_API, userStatusResolvers_Ws } from './user_status';
import { dummyResolver_Ws } from './dummy';

// Merge all resolvers: Add more in the future if needed
// e.g [userResolver, postResolver, channelResolver]
export const apiResolvers = mergeResolvers([
  userResolver,
  relationshipResolver,
  userStatusResolvers_API,
]);

export const wsResolvers = mergeResolvers([
  dummyResolver_Ws,
  userStatusResolvers_Ws,
]);
