"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
const pino_1 = require("pino");
const config_1 = __importDefault(require("@/config"));
const options = {
    level: config_1.default.MODE === "development" ? "trace" : "info",
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            ignore: "pid,hostname",
        },
    },
};
exports.log = (0, pino_1.pino)(options);
