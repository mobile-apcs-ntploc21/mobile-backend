import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";

const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: false,
      message: "Something went wrong !",
      error: err,
    });
  }
};

export default (
  err: AppError,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "production") {
    if (err.name === "CastError")
      err = new AppError(400, `Invalid ${err.path}: ${err.value}`);
    if (err.code === 11000) err = new AppError(400, `Duplicate field value`);
    sendErrorProd(err, res);
  } else if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  }

  next();
};
