import dotenv from "dotenv";
import startApp from "./app";
import mongoose, { ConnectOptions } from "mongoose";
import { config } from "./config";

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
      console.log("Connect to database successful !");
    })
    .catch((error) => {
      console.error("Error connecting to the database", error);
    });

  const app = await startApp();
  // app.listen(config.PORT, () => {
  //   console.log(`App running on port ${port} ...`);
  // });
};

StartServer();
