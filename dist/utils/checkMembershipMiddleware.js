"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkMembershipMiddleware = void 0;
const graphql_1 = __importDefault(require("../utils/graphql"));
const queries_1 = require("../graphql/queries");
const checkMembershipMiddleware = async (req, res, next) => {
    const { uid: user_id } = res.locals;
    const { serverId } = req.params;
    if (!serverId) {
        res.status(400).json({ status: "fail", message: "Server ID is required." });
        return;
    }
    if (res.locals?.server_id === serverId) {
        return next();
    }
    try {
        const flag = await (0, graphql_1.default)().request(queries_1.serverMemberQueries.CHECK_SERVER_MEMBER, {
            server_id: serverId,
            user_id,
        });
        if (flag === null || !flag.checkServerMember) {
            res.status(403).json({
                status: "fail",
                message: "You are not a member of this server",
            });
            return;
        }
        res.locals.server_id = serverId;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.checkMembershipMiddleware = checkMembershipMiddleware;
