"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_1 = require("./swagger");
const fs_1 = __importDefault(require("fs"));
fs_1.default.writeFileSync("swagger.json", JSON.stringify(swagger_1.swaggerSpec, null, 2));
