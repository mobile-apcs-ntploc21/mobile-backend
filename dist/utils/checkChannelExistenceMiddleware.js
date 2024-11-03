"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkChannelExistenceMiddleware = void 0;
const graphql_1 = __importDefault(require("../utils/graphql"));
const queries_1 = require("../graphql/queries");
const checkChannelExistenceMiddleware = async (req, res, next) => {
    const { channelId } = req.params;
    if (res.locals?.channel_id === channelId) {
        next();
        return;
    }
    try {
        const { getChannel: channel } = await (0, graphql_1.default)().request(queries_1.serverChannelQueries.GET_CHANNEL, {
            channel_id: channelId,
        });
        if (!channel) {
            res.status(404).json({ message: "Channel not found" });
            return;
        }
        res.locals.channel_id = channelId;
        res.locals.channelObject = channel;
        next();
    }
    catch (error) {
        return next(error);
    }
};
exports.checkChannelExistenceMiddleware = checkChannelExistenceMiddleware;
