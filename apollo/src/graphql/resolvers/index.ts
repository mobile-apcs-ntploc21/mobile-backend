import { mergeResolvers } from "@graphql-tools/merge";

import userResolver from "./user";
import userSettingsResolvers from "./userSettings";
import relationshipResolver from "./relationship";
import friendResolvers from "./relationship";
import userProfileResolvers from "./user_profile";

// Merge all resolvers: Add more in the future if needed
// e.g [userResolver, postResolver, channelResolver]
const resolvers = mergeResolvers([
  userResolver,
  relationshipResolver,
  userProfileResolvers,
  userSettingsResolvers,
]);

export default resolvers;
