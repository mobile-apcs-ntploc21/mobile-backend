import { LoggerOptions, pino } from "pino";
import config from "@/config";
import path from "path";

const logFilePath = path.resolve("/logs/api.log");

const options: LoggerOptions = {
  level: config.MODE === "development" ? "trace" : "info",
};

const log = pino(options, pino.destination(logFilePath));

export { log };
