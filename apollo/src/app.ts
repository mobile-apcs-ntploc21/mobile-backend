import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { WebSocketServer } from "ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { useServer } from "graphql-ws/lib/use/ws";

import http from "http";
import { config } from "./config";
import { apolloTypedefs } from "./graphql/typedefs";
import { apolloResolvers } from "./graphql/resolvers";
import startWsServer from "./wss";

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

  // Create WebSocket Server
  const wsCleanup = startWsServer(httpserver);

  // Create Apollo Server
  const apolloServer = new ApolloServer({
    typeDefs: apolloTypedefs,
    resolvers: apolloResolvers,
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
  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    path: config.GRAPHQL_ROUTE,
    cors: true,
  });

  app.use(config.GRAPHQL_ROUTE, limiter);

  return httpserver;
};

export default startApp;
