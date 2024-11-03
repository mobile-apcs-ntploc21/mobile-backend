"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appError_1 = __importDefault(require("../utils/appError"));
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack,
    });
};
const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    else {
        res.status(500).json({
            status: false,
            message: "Something went wrong !",
            error: err,
        });
    }
};
exports.default = (err, _req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    if (process.env.NODE_ENV === "production") {
        if (err.name === "CastError")
            err = new appError_1.default(400, `Invalid ${err.path}: ${err.value}`);
        if (err.code === 11000)
            err = new appError_1.default(400, `Duplicate field value`);
        sendErrorProd(err, res);
    }
    else if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, res);
    }
    next();
};
