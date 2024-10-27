import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Router } from "express";
import config from "./config";

const swaggerOptions = {
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
    tags: [
      {
        name: "Users",
      },
    ],
    servers: [
      {
        url: `http://localhost:${config.PORT}/api/v1`,
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

const swaggerRouter = Router().use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs)
);

export default swaggerRouter;
