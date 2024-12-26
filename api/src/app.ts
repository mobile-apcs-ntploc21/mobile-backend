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
