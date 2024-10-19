declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      PORT: string;

      JWT_SECRET: string;
      REFRESH_TOKEN_SECRET: string;

      DATABASE: string;
      DATABASE_USERNAME: string;
      DATABASE_PASSWORD: string;

      MAX_RATE_LIMIT: string;
      MAX_RATE_LIMIT_TIME: string;
      PING_INTERVAL: string;
    }
  }
}

export {};
