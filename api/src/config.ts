import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

const config = {
  PORT: process.env.PORT ?? 4000,

  JWT_SECRET: process.env.JWT_SECRET ?? "secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "1d",
  JWT_REFRESH_SECRET: process.env.REFRESH_TOKEN_SECRET ?? "secret",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",

  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ?? "hello",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ?? "hello",
  AWS_SESSION_TOKEN: process.env.AWS_SESSION_TOKEN ?? "hello",
  AWS_REGION: process.env.AWS_REGION ?? "hello",
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME ?? "hello",
  CDN_URL: "cdn.ntploc21.xyz",

  GQL_SERVER_URL: process.env.GQL_SERVER_URL ?? "http://apollo:4000",
};

export default config;
