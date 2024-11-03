"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const graphql_1 = __importDefault(require("../utils/graphql"));
const queries_1 = require("../graphql/queries");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const getUserById = async (id) => {
    const response = await (0, graphql_1.default)().request(queries_1.GET_USER_BY_ID, {
        id: id,
    });
    return response.getUserById;
};
const authMiddleware = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        else {
            res.status(401).json({
                status: "fail",
                message: "You are not authorized to access this route",
            });
            return;
        }
        if (!token) {
            res.status(401).json({
                status: "fail",
                message: "You are not authorized to access this route",
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.JWT_SECRET);
        const user = await getUserById(decoded.id);
        if (!user) {
            res.status(401).json({
                status: "fail",
                message: "The user belonging to this token does no longer exist",
            });
            return;
        }
        if (user.passwordChangedAt) {
            const changedTimestamp = user.passwordChangedAt / 1000;
            if (decoded.iat && decoded.iat < changedTimestamp) {
                res.status(401).json({
                    status: "fail",
                    message: "User recently changed password, please login again",
                });
                return;
            }
        }
        res.locals.uid = user.id;
        res.locals.token = token;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authMiddleware = authMiddleware;
