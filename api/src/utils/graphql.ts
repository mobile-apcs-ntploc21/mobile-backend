import { GraphQLClient } from "graphql-request";
import config from "../config";

type RequestCache =
  | "default"
  | "no-store"
  | "reload"
  | "no-cache"
  | "force-cache"
  | "only-if-cached";

type Options = {
  cache?: RequestCache;
};

const graphQLClient = (
  token?: string,
  options: Options = {}
): GraphQLClient => {
  const { cache = "default" } = options;

  return new GraphQLClient(`${config.GQL_SERVER_URL}/graphql`, {
    headers: {
      ...(token && { authorization: `Bearer ${token}` }),
    },
    cache: cache,
  });
};

export default graphQLClient;
