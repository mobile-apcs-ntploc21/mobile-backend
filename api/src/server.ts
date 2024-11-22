import {
  Application,
  json,
  urlencoded,
  Request,
  Response,
  NextFunction,
} from "express";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import xss from "xss-clean";
import http from "http";

import { log } from "@/utils/log";
import config from "@/config";
import appliationRoutes from "@/routes";

export default class Server {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routeMiddleware(this.app);
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    // Set security http header
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

    // Set rate limit if not in development
    if (process.env.NODE_ENV !== "development") app.use("/api", limiter);

    // Set environment
    if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

    // Middleware for CORS
    app.use(cors());
  }

  private standardMiddleware(app: Application): void {
    app.use(json({ limit: "50mb" }));
    app.use(urlencoded({ limit: "50mb", extended: true }));
  }

  private routeMiddleware(app: Application): void {
    appliationRoutes(app);
  }

  private globalErrorHandler(app: Application): void {
    app.all("*", (req: Request, res: Response, next: NextFunction) => {
      res.status(404).json({
        status: "fail",
        message: `Can't find ${req.originalUrl} on this server!`,
      });
    });

    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      // Log error
      log.error(err);

      // Send error response
      res.status(err.statusCode || 500).json({
        status: "error",
        message: err.message,
      });
      next();
    });
  }

  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      this.startHttpServer(httpServer);
    } catch (error) {
      log.error(error);
    }
  }

  private startHttpServer(httpServer: http.Server): void {
    log.info(`Server has started with process id ${process.pid}`);
    httpServer.listen(config.PORT, () => {
      log.info(`API is listening on port ${config.PORT}...`);
    });
  }
}
