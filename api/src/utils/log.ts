import { LoggerOptions, pino } from "pino";
import config from "@/config";

const options: LoggerOptions = {
  level: config.MODE === "development" ? "trace" : "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      ignore: "pid,hostname",
    },
  },
};

export const log = pino(options);
