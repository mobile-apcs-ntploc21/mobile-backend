import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import AppError from "./utils/appError";

import { ApolloServer } from "apollo-server-express";
import resolvers from "./graphql/resolvers";
import typeDefs from "./graphql/typedefs";
import http from "http";

// SET SECURITY HTTP HEADER
const app = express();
app.use(helmet());

// Data sanitization against noSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

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

let apolloServer = null;
async function startServer() {
  apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: "/graphql", cors: true });
}
startServer();
const httpserver = http.createServer(app);

app.use("/graphql", limiter);

export default app;
