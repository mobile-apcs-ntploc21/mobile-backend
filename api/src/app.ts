import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import globalErrorHandler from "./controllers/error";
import { authMiddleware } from "./utils/authMiddleware";
import userRouter from "./routes/user";
import friendRouter from "./routes/friend";
import settingsRouter from "./routes/settings";
import userProfileRouter from "./routes/user_profile";
import userStatusRouter from "./routes/user_status";
import serverRouter from "./routes/servers/server";
import serverEmojiRouter from "./routes/servers/serverEmojis";
import serverBansRouter from "./routes/servers/server_bans";

dotenv.config({ path: "./config.env" });

const app = express();

app.use(helmet()); // SET SECURITY HTTP HEADER
app.use(mongoSanitize()); // Data sanitization against noSQL query injection
app.use(xss()); // Data sanitization against XSS

// Set body parser limit
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Rate limit
const limiter = rateLimit({
  max: Number(process.env.MAX_RATE_LIMIT),
  windowMs: Number(process.env.MAX_RATE_LIMIT_TIME) * 60 * 1000, // unit: minutes
  message: `Too many requests from this IP, please try again after ${process.env.MAX_RATE_LIMIT_TIME} minutes !`,
});

app.use("/api", limiter);

// Set environment
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Middleware
app.use(express.json());
app.use(cors());

// Set default route
/// Users
app.use("/api/v1/users", userRouter);
app.use("/api/v1/settings", authMiddleware, settingsRouter);
app.use("/api/v1/", authMiddleware, userStatusRouter);
app.use("/api/v1/", authMiddleware, friendRouter);
app.use("/api/v1/profile/", authMiddleware, userProfileRouter);

/// Server
app.use("/api/v1/servers", serverRouter);
app.use("/api/v1/servers", serverEmojiRouter);
app.use("/api/v1/servers", authMiddleware, serverBansRouter);

// Handle when go to undefined route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    status: "fail",
    message: `Cannot find ${req.originalUrl} on this server !`,
  });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err);
    res.set("Content-Type", "application/json");
    res.statusCode = 400;
    return res.json({
      error: {
        message: err.message,
      },
    });
  }
);

// Handle global error
app.use(globalErrorHandler);

app.listen(4001, () => console.log("API is listening on port 4001..."));

export default app;
