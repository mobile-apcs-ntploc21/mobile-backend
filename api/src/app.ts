// eslint-disable-next-line @typescript-eslint/no-require-imports
require("elastic-apm-node").start({
  serviceName: process.env.ELASTIC_APM_SERVICE_NAME,
  serverUrl: process.env.ELASTIC_APM_SERVER_URL,
  secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
  environment: process.env.ELASTIC_APM_ENVIRONMENT,
  verifyServerCert: false,
});

import express, { Express } from "express";

import OrantioServer from "@/server";
import config from "@/config";

class Application {
  public static start(): void {
    const app: Express = express();

    const server = new OrantioServer(app);
    server.start();
  }
}

Application.start();
