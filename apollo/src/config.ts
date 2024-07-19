interface IOptions {
  HOST: string;
  PORT: string | number;
  HTTPS_PORT: string | number;
  GRAPHQL_ROUTE: string;
  GRAPHIQL_ROUTE: string;
  GRAPHQL_ENDPOINT: string;
  WEBSOCKET_ROUTE: string;
  WEBSOCKET_ENDPOINT: string;
}

const config: IOptions = {
  HOST: process.env.HOST || "localhost",
  PORT: process.env.PORT || 4000,
  HTTPS_PORT: process.env.HTTPS_PORT || 4002,
  GRAPHQL_ROUTE: "/graphql",
  GRAPHIQL_ROUTE: "/graphiql",
  GRAPHQL_ENDPOINT: "",
  WEBSOCKET_ROUTE: "/subscriptions",
  WEBSOCKET_ENDPOINT: "",
};

config.GRAPHQL_ENDPOINT = `http://${config.HOST}:${config.PORT}${config.GRAPHQL_ROUTE}`;
config.WEBSOCKET_ENDPOINT = `ws://${config.HOST}:${config.PORT}${config.WEBSOCKET_ROUTE}`;

export { config };
