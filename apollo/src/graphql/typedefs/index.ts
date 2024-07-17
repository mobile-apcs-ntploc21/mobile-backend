import { gql } from "apollo-server-express";
import { mergeTypeDefs } from "@graphql-tools/merge";

import userSchema from "./user";

import relationshipSchema from "./relationship";
import serverSchema from "./server";

const linkedSchema = gql`
  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
`;

// Merge all typeDefs: Add more in the future if needed
// e.g [userSchema, postSchema, channelSchema]
const typeDefs = mergeTypeDefs([linkedSchema, userSchema, relationshipSchema, serverSchema]);

export default typeDefs;
