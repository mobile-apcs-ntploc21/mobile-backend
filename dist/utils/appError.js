"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AppError extends Error {
    statusCode;
    status;
    isOperational;
    path;
    value;
    code;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.status = false;
        this.isOperational = true;
        this.path = "";
        this.value = "";
        this.code = 0;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.default = AppError;
