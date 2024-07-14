import { mergeResolvers } from "@graphql-tools/merge";

import userResolver from "./user";
import userSettingsResolvers from "./userSettings";
import relationshipResolver from "./relationship";

// Merge all resolvers: Add more in the future if needed
// e.g [userResolver, postResolver, channelResolver]
const resolvers = mergeResolvers([userResolver, userSettingsResolvers, relationshipResolver]);

export default resolvers;
