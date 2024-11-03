import { GraphQLClient } from "graphql-request";
import config from "../config";

export default function graphQLClient(token?: string) {
  return new GraphQLClient(`${config.GQL_SERVER_URL}/graphql`, {
    headers: {
      ...(token && { authorization: `Bearer ${token}` }),
    },
  });
}
