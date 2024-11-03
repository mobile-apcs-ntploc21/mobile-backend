"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkServerAdminMiddleware = void 0;
const graphql_1 = __importDefault(require("../utils/graphql"));
const queries_1 = require("../graphql/queries");
const log_1 = require("@/utils/log");
const checkServerAdminMiddleware = async (_req, res, next) => {
    const { uid, server_id } = res.locals;
    if (!server_id) {
        res.status(400).json({ status: "fail", message: "Server ID is required." });
        return;
    }
    try {
        const { server: { owner }, } = await (0, graphql_1.default)().request(queries_1.serverQueries.GET_SERVER_BY_ID, {
            server_id: server_id,
        });
        log_1.log.debug(owner, uid);
        if (owner !== uid) {
            const { getRolesAssignedWithUser: roles } = await (0, graphql_1.default)().request(queries_1.serverRoleQueries.GET_ROLES_ASSIGNED_WITH_USER, {
                user_id: uid,
                server_id: server_id,
            });
            const isAdmin = roles.some((role) => role.is_admin);
            if (!isAdmin) {
                res.status(403).json({
                    status: "fail",
                    message: "You are not authorized to make this request",
                });
                return;
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.checkServerAdminMiddleware = checkServerAdminMiddleware;
