import { LoggerOptions, pino } from "pino";

const options: LoggerOptions = {
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      ignore: "pid,hostname",
    },
  },
};

export const log = pino(options);
