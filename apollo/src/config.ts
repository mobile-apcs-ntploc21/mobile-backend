import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

const config = {
  HOST: process.env.HOST ?? "localhost",
  PORT: process.env.PORT ?? 4000,
  MODE: process.env.NODE_ENV ?? "development",
  GRAPHQL_ROUTE: "/graphql",
  GRAPHQL_ENDPOINT: "",
  WEBSOCKET_ROUTE: "/subscriptions",
  WEBSOCKET_ENDPOINT: "",
  JWT_SECRET: process.env.JWT_SECRET ?? "jwtsecret",
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET ?? "refreshsecret",
  PING_INTERVAL: process.env.PING_INTERVAL
    ? parseInt(process.env.PING_INTERVAL)
    : 30000,
};

config.GRAPHQL_ENDPOINT = `http://${config.HOST}:${config.PORT}${config.GRAPHQL_ROUTE}`;
config.WEBSOCKET_ENDPOINT = `ws://${config.HOST}:${config.PORT}${config.WEBSOCKET_ROUTE}`;

export { config };
