import { mergeResolvers } from "@graphql-tools/merge";

import userResolver from "./user";
import userSettingsResolvers from "./userSettings";
import relationshipResolver from "./relationship";
import friendResolvers from "./relationship";
import { userProfileApollo, userProfileWs } from "./user_profile";

// Merge all resolvers: Add more in the future if needed
// e.g [userResolver, postResolver, channelResolver]
export const apolloResolvers = mergeResolvers([
  userResolver,
  relationshipResolver,
  userProfileApollo,
  userSettingsResolvers,
]);

export const wsResolvers = mergeResolvers([userProfileWs]);
