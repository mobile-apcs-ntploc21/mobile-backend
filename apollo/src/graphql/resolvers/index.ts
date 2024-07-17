import { mergeResolvers } from "@graphql-tools/merge";

import userResolver from "./user";
import relationshipResolver from "./relationship";
import serverResolver from "./server";

// Merge all resolvers: Add more in the future if needed
// e.g [userResolver, postResolver, channelResolver]
const resolvers = mergeResolvers([userResolver, relationshipResolver, serverResolver]);

export default resolvers;
