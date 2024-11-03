"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOwnerMiddleware = void 0;
const graphql_1 = __importDefault(require("../utils/graphql"));
const queries_1 = require("../graphql/queries");
const log_1 = require("@/utils/log");
const checkOwnerMiddleware = async (req, res, next) => {
    const { uid } = res.locals;
    const { serverId } = req.params;
    if (!serverId) {
        res.status(400).json({ status: "fail", message: "Server ID is required." });
        return;
    }
    try {
        const { server: { owner }, } = await (0, graphql_1.default)().request(queries_1.serverQueries.GET_SERVER_BY_ID, {
            server_id: serverId,
        });
        log_1.log.debug(owner, uid);
        if (owner !== uid) {
            res.status(403).json({
                status: "fail",
                message: "You are not the owner of this server",
            });
            return;
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.checkOwnerMiddleware = checkOwnerMiddleware;
