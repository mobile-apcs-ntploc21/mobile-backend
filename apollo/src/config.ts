interface IOptions {
  HOST: string;
  PORT: string | number;
  GRAPHQL_ROUTE: string;
  GRAPHQL_ENDPOINT: string;
  WEBSOCKET_ROUTE: string;
  WEBSOCKET_ENDPOINT: string;
  JWT_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  PING_INTERVAL: number;
  IS_DEV?: boolean;
}

const config: IOptions = {
  HOST: process.env.HOST || 'localhost',
  PORT: process.env.PORT || 4000,
  GRAPHQL_ROUTE: '/graphql',
  GRAPHQL_ENDPOINT: '',
  WEBSOCKET_ROUTE: '/subscriptions',
  WEBSOCKET_ENDPOINT: '',
  JWT_SECRET: process.env.JWT_SECRET || 'jwtsecret',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'refreshsecret',
  PING_INTERVAL: process.env.PING_INTERVAL
    ? parseInt(process.env.PING_INTERVAL)
    : 30000,
  IS_DEV: process.env.NODE_ENV === 'development',
};

console.log(process.env.NODE_ENV);

config.GRAPHQL_ENDPOINT = `http://${config.HOST}:${config.PORT}${config.GRAPHQL_ROUTE}`;
config.WEBSOCKET_ENDPOINT = `ws://${config.HOST}:${config.PORT}${config.WEBSOCKET_ROUTE}`;

export { config };
