// eslint-disable-next-line @typescript-eslint/no-require-imports
require("elastic-apm-node").start({
  serviceName: process.env.ELASTIC_APM_SERVICE_NAME,
  serverUrl: process.env.ELASTIC_APM_SERVER_URL,
  secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
  environment: process.env.ELASTIC_APM_ENVIRONMENT,
  verifyServerCert: false,
});

import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";

import http from "http";
import { config } from "./config";
import startWsServer from "./wss";
import { apiTypeDefs, wsTypeDefs } from "./graphql/typedefs";
import { apiResolvers, wsResolvers } from "./graphql/resolvers";
import { getUserIdByToken } from "./utils/auth";
import { log } from "@/utils/log";
import { directMessagePubSub } from "./graphql/pubsub/pubsub";

const startApp = async () => {
  const app = express();
  const httpserver = http.createServer(app);

  app.use(helmet()); // set security HTTP headers
  app.use(mongoSanitize()); // Data sanitization against noSQL query injection
  app.use(xss()); // Data sanitization against XSS

  // Rate limit
  const limiter = rateLimit({
    max: Number(process.env.MAX_RATE_LIMIT),
    windowMs: Number(process.env.MAX_RATE_LIMIT_TIME) * 60 * 1000, // unit: minutes
    message: `Too many requests from this IP, please try again after ${process.env.MAX_RATE_LIMIT_TIME} minutes !`,
  });

  // set environment
  if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

  // middleware
  app.use(express.json());
  app.use(cors());

  // Create Apollo Server for API
  const apolloServerForAPI = new ApolloServer({
    cache: "bounded",
    typeDefs: apiTypeDefs,
    resolvers: apiResolvers,
    introspection: config.MODE === "development",
    context: async ({ req, res }) => {
      try {
        const token = req.headers.authorization || "";
        if (!token) return { req, res, user_id: null, directMessagePubSub };

        const user_id = await getUserIdByToken(token.split(" ")[1]);
        return { req, res, user_id, directMessagePubSub };
      } catch (error) {
        log.debug(error);
        return { req, res, user_id: null, directMessagePubSub };
      }
    },
  });
  await apolloServerForAPI.start();
  apolloServerForAPI.applyMiddleware({
    app,
    path: config.GRAPHQL_ROUTE,
    cors: true,
  });

  // Create WebSocket Server
  const wsCleanup = startWsServer(httpserver);

  // Create Apollo Server Websocket
  const apolloServerForWs = new ApolloServer({
    cache: "bounded",
    typeDefs: wsTypeDefs,
    resolvers: wsResolvers,
    introspection: config.MODE === "development",
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer: httpserver }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await wsCleanup.dispose();
            },
          };
        },
      },
    ],
  });
  await apolloServerForWs.start();
  apolloServerForWs.applyMiddleware({
    app,
    path: config.WEBSOCKET_ROUTE,
    cors: true,
  });

  // Add rate limiter middleware if not in development mode
  if (config.MODE !== "development") {
    app.use(config.GRAPHQL_ROUTE, limiter);
  }

  return httpserver;
};

export default startApp;
