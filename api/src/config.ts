import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

const config = {
  PORT: process.env.PORT ?? 4000,
  MODE: process.env.NODE_ENV ?? "development",

  REDIS_PASSWORD: process.env.REDIS_PASSWORD ?? "password",
  REDIS_HOST: process.env.REDIS_HOST ?? "localhost",
  REDIS_PORT: process.env.REDIS_PORT?.toString() ?? "6379",

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

  VNPAY_TMNCODE: process.env.VNPAY_TMNCODE ?? "hello",
  VNPAY_SECRET_KEY: process.env.VNPAY_SECRET_KEY ?? "hello",
  VNPAY_RETURN_URL: process.env.VNPAY_RETURN_URL ?? "hello",
  VNPAY_API_URL:
    process.env.VNPAY_API_URL ??
    "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",

  GQL_SERVER_URL: process.env.GQL_SERVER_URL ?? "http://orantio-apollo:4000",
};

export default config;
