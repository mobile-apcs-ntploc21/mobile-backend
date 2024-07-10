import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";

import userRouter from "./routes/user";
import AppError from "./utils/appError";
import globalErrorHandler from "./controllers/error";

const app = express();

// SET SECURITY HTTP HEADER
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

app.use("/api", limiter);

// Set environment
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Middleware
app.use(express.json());
app.use(cors());

// Set default route
app.use("/api/v1/users", userRouter);

// Handle when go to undefined route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  // next(new AppError(404, `Can't find ${req.originalUrl} on this server !`));
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server !`,
  });
});

//Handle global error
app.use(globalErrorHandler);

// Handle undefined route
// app.use((req: Request, res: Response, next: NextFunction) => {
//   res.status(404).json({
//     status: "fail",
//     message: `Can't find ${req.originalUrl} on this server !`,
//   });
// });

app.listen(4001, () => console.log("API is listening on port 4001..."));

export default app;
