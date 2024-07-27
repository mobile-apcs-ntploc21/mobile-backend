import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

import mongoose, { ConnectOptions } from "mongoose";
import startApp from "./app";
import { config } from "./config";

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
      console.log("Connect to database successful !");
    })
    .catch((error) => {
      console.error("Error connecting to the database", error);
    });

  const port = process.env.PORT || 4000;

  const httpserver = await startApp();

  httpserver.listen(port, () => {
    console.log(`Apollo Server is running at ${config.GRAPHQL_ENDPOINT}`);
    console.log(`WebSocket Server is running at ${config.WEBSOCKET_ENDPOINT}`);
  });
};

StartServer();
