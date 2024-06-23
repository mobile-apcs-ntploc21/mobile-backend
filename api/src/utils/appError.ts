class AppError extends Error {
    statusCode: number;
    status: boolean | string;
    isOperational: boolean;
    path: string;
    value: string;
    code: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.status = false;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;