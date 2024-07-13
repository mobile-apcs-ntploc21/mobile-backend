import { mergeResolvers } from "@graphql-tools/merge";

import userResolver from "./user";
import relationshipResolver from "./relationship";
import friendResolvers from "./relationship";

// Merge all resolvers: Add more in the future if needed
// e.g [userResolver, postResolver, channelResolver]
const resolvers = mergeResolvers([userResolver, relationshipResolver]);

export default resolvers;
