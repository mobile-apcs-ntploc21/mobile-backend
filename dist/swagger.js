"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const express_1 = require("express");
const config_1 = __importDefault(require("./config"));
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Orantio API Documentation",
            version: "1.0.0",
            description: "This is the API documentation for communicating between mobile application and the server.",
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        servers: [
            {
                url: `http://localhost:${config_1.default.PORT}/api/v1`,
            },
        ],
    },
    apis: ["./src/routes/**/*.ts", "./src/utils/**/*.ts"],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.swaggerSpec = swaggerSpec;
const swaggerOptions = {
    swaggerOptions: {
        operationsSorter: (a, b) => {
            const methodsOrder = [
                "get",
                "post",
                "put",
                "patch",
                "delete",
                "options",
                "trace",
            ];
            let result = methodsOrder.indexOf(a.get("method")) -
                methodsOrder.indexOf(b.get("method"));
            if (result === 0) {
                result = a.get("path").localeCompare(b.get("path"));
            }
            return result;
        },
    },
};
const swaggerRouter = (0, express_1.Router)()
    .use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec, swaggerOptions))
    .get("/api-docs.json", (_, res) => {
    res.json(swaggerSpec);
});
exports.default = swaggerRouter;
