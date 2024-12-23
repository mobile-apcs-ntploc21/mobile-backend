import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi, { SwaggerUiOptions } from "swagger-ui-express";
import { Router } from "express";

import config from "../config";
import operationsSorter from "./operations-sorter";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Orantio API Documentation",
      version: "1.0.0",
      description:
        "This is the API documentation for communicating between mobile application and the server.",
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
        url: `http://localhost:${config.PORT}/api/v1`,
      },
    ],
  },
  apis: ["./src/routes/**/*.ts", "./src/utils/**/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerOptions: SwaggerUiOptions = {
  swaggerOptions: {
    operationsSorter,
  },
};

const swaggerRouter = Router()
  .use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, swaggerOptions)
  )
  .get("/api-docs.json", (_, res) => {
    res.json(swaggerSpec);
  });

export { swaggerSpec };
export default swaggerRouter;
