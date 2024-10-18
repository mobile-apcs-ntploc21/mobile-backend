import dotenv from "dotenv";
import mongoose, { ConnectOptions } from "mongoose";
import startApp from "./app";
import { config } from "./config";
import { log } from "@/utils/log";

dotenv.config({ path: "./config.env" });

const StartServer = async () => {
  mongoose.set("strictQuery", true);

  let DB_URI = process.env.DATABASE!.replace(
    "<username>",
    process.env.DATABASE_USERNAME!
  );
  DB_URI = DB_URI.replace("<password>", process.env.DATABASE_PASSWORD!);

  await mongoose
    .connect(DB_URI, {} as ConnectOptions)
    .then(() => {
      log.info("Connect to database successful !");
    })
    .catch((error) => {
      log.error("Error connecting to the database", error);
    });

  const port = process.env.PORT || 4000;

  const httpserver = await startApp();

  httpserver.listen(port, () => {
    log.info(`Apollo Server is running at ${config.GRAPHQL_ENDPOINT}`);
    log.info(`WebSocket Server is running at ${config.WEBSOCKET_ENDPOINT}`);
  });
};

StartServer();
