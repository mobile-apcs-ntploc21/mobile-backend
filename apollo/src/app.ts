import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import http from "http";
import { ApolloServer } from "apollo-server-express";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";

import resolvers from "./graphql/resolvers";
import typeDefs from "./graphql/typedefs";
import { config } from "./config";

// const checkToken = (token: string) => {
//   const parts = token.split(" ");
//   const bearer = parts[0],
//     credential = parts[1];

//   if (/^Bearer$/i.test(bearer) && credential) {
//     const user = getUserFromToken(credential);
//     if (user) {
//       return { user };
//     }
//   }

//   return { user: null };
// };

// const getUserFromToken = (token) => {
//   try {
//     if (token) {
//       return jwt.verify(token, process.env.JWT_SECRET!);
//     }
//     return null;
//   } catch (error) {
//     return null;
//   }
// };

async function startApp() {
  const app: express.Application = express();
  const httpServer = http.createServer(app);
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  app.use(helmet()); // SET SECURITY HTTP HEADER
  app.use(mongoSanitize()); // Data sanitization against noSQL query injection
  app.use(xss()); // Data sanitization against XSS

  // Rate limit
  const limiter = rateLimit({
    max: Number(process.env.MAX_RATE_LIMIT),
    windowMs: Number(process.env.MAX_RATE_LIMIT_TIME) * 60 * 1000, // unit: minutes
    message: `Too many requests from this IP, please try again after ${process.env.MAX_RATE_LIMIT_TIME} minutes !`,
  });

  // Set environment
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  // Middlewares
  app.use(express.json());
  app.use(cors());

  // Set up the WebSocket for handling GraphQL subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: config.WEBSOCKET_ROUTE,
  });
  const serverCleanup = useServer(
    {
      schema,
      onConnect: (ctx) => {
        console.log("Client connected");
        // if (ctx?.connectionParams?.Authorization) {
        //   return checkToken(ctx.connectionParams.Authorization as string);
        // }
        // throw new Error("Missing auth token!");
      },
      onDisconnect: (ctx, code, reason) => {
        console.log("Client disconnected");
      },
    },
    wsServer
  );

  // Set up Apollo Server
  const apolloServer = new ApolloServer({
    schema,
    introspection: true,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
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

  // Handle subscription over http
  httpServer.listen(config.PORT, () => {
    console.log(
      `Apollo Server is listening on http://localhost:${config.PORT}${config.GRAPHQL_ROUTE}`
    );
  });

  return app;
}

export default startApp;
