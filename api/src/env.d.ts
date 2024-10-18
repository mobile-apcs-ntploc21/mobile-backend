declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number;
      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;
      JWT_REFRESH_SECRET: string;
      JWT_REFRESH_EXPIRES_IN: string;

      AWS_ACCESS_KEY_ID?: string;
      AWS_SECRET_ACCESS_KEY?: string;
      AWS_SESSION_TOKEN?: string;
      AWS_REGION?: string;
      AWS_S3_BUCKET_NAME?: string;
      CDN_URL?: string;

      GQL_SERVER_URL: string;
    }
  }
}

export {};
