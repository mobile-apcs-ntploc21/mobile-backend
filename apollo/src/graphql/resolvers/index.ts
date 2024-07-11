import { mergeResolvers } from "@graphql-tools/merge";

import userResolver from "./user";

// Merge all resolvers: Add more in the future if needed
// e.g [userResolver, postResolver, channelResolver]
const resolvers = mergeResolvers([userResolver]);

export default resolvers;
