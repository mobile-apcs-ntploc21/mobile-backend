"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveAllChannel = exports.moveChannel = exports.hardDeleteChannel = exports.deleteChannel = exports.updateChannel = exports.createChannel = exports.getChannels = exports.getChannel = exports._getChannel = void 0;
const graphql_1 = __importDefault(require("@/utils/graphql"));
const queries_1 = require("@/graphql/queries");
const mutations_1 = require("@/graphql/mutations");
const _getChannel = async (channel_id) => {
    try {
        const response = await (0, graphql_1.default)().request(queries_1.serverChannelQueries.GET_CHANNEL, {
            channel_id,
        });
        return response.getChannel;
    }
    catch (error) {
        return null;
    }
};
exports._getChannel = _getChannel;
const _getChannels = async (server_id, user_id) => {
    try {
        const response = await (0, graphql_1.default)().request(queries_1.serverChannelQueries.GET_CHANNELS, {
            server_id,
            user_id,
        });
        const channels = response.getChannels.map((channel) => {
            return channel;
        });
        return channels.sort((a, b) => a.position - b.position);
    }
    catch (error) {
        return null;
    }
};
const getChannel = async (req, res, next) => {
    const server_id = res.locals.server_id;
    const channel_id = req.params?.channelId;
    if (!server_id) {
        res.status(400).json({ message: "Server ID is required." });
        return;
    }
    if (!channel_id) {
        res.status(400).json({ message: "Channel ID is required." });
        return;
    }
    try {
        const channel = await (0, exports._getChannel)(channel_id).catch(() => null);
        if (!channel) {
            res.status(404).json({ message: "Channel not found." });
            return;
        }
        res.status(200).json({ ...channel });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.getChannel = getChannel;
const getChannels = async (req, res, next) => {
    const server_id = res.locals.server_id;
    const user_id = res.locals.uid ?? null;
    if (!server_id) {
        res.status(400).json({ message: "Server ID is required." });
        return;
    }
    try {
        const channels = await _getChannels(server_id, user_id).catch(() => null);
        res.status(200).json({ channels });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.getChannels = getChannels;
const createChannel = async (req, res, next) => {
    const server_id = res.locals.server_id;
    const { name, category_id } = req.body;
    if (!server_id || !name) {
        res.status(400).json({ message: "Server ID and name is required." });
        return;
    }
    try {
        const channel = await (0, graphql_1.default)().request(mutations_1.channelMutations.CREATE_CHANNEL, {
            server_id,
            input: {
                name,
                category_id,
            },
        });
        res.status(200).json({ ...channel.createChannel });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.createChannel = createChannel;
const updateChannel = async (req, res, next) => {
    const server_id = res.locals.server_id;
    const channel_id = req.params?.channelId;
    const { name, description, is_nsfw, is_archived, is_deleted } = req.body;
    if (!server_id) {
        res.status(400).json({ message: "Server ID is required." });
        return;
    }
    if (!channel_id) {
        res.status(400).json({ message: "Channel ID is required." });
        return;
    }
    const channel = await (0, exports._getChannel)(channel_id).catch(() => null);
    if (!channel || channel.server_id !== server_id) {
        res.status(404).json({ message: "Channel not found." });
        return;
    }
    try {
        const channel = await (0, graphql_1.default)().request(mutations_1.channelMutations.UPDATE_CHANNEL, {
            channel_id,
            input: {
                name,
                description,
                is_nsfw,
                is_archived,
                is_deleted,
            },
        });
        res.status(200).json({ ...channel.updateChannel });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.updateChannel = updateChannel;
const deleteChannel = async (req, res, next) => {
    const server_id = res.locals.server_id;
    const channel_id = req.params?.channelId;
    if (!server_id) {
        res.status(400).json({ message: "Server ID is required." });
        return;
    }
    if (!channel_id) {
        res.status(400).json({ message: "Channel ID is required." });
        return;
    }
    const channel = await (0, exports._getChannel)(channel_id).catch(() => null);
    if (!channel || channel.server_id !== server_id) {
        res.status(404).json({ message: "Channel not found." });
        return;
    }
    try {
        await (0, graphql_1.default)().request(mutations_1.channelMutations.DELETE_CHANNEL, {
            channel_id,
        });
        res.status(200).json({ message: "Channel deleted." });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.deleteChannel = deleteChannel;
const hardDeleteChannel = async (req, res, next) => {
    const channel_id = req.params?.channelId;
    if (!channel_id) {
        res.status(400).json({ message: "Channel ID is required." });
        return;
    }
    try {
        await (0, graphql_1.default)().request(mutations_1.channelMutations.HARD_DELETE_CHANNEL, {
            channel_id,
        });
        res.status(200).json({ message: "Channel hard deleted." });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.hardDeleteChannel = hardDeleteChannel;
const moveChannel = async (req, res, next) => {
    const server_id = res.locals.server_id;
    const channel_id = req.params?.channelId;
    const { category_id, new_position } = req.body;
    if (!server_id) {
        res.status(400).json({ message: "Server ID is required." });
        return;
    }
    if (!channel_id) {
        res.status(400).json({ message: "Channel ID is required." });
        return;
    }
    if (new_position === undefined) {
        res.status(400).json({ message: "New position is required." });
        return;
    }
    const channel = await (0, exports._getChannel)(channel_id).catch(() => null);
    if (!channel || channel.server_id !== server_id) {
        res.status(404).json({ message: "Channel not found." });
        return;
    }
    try {
        const channel = await (0, graphql_1.default)().request(mutations_1.channelMutations.MOVE_CHANNEL, {
            channel_id,
            category_id,
            new_position,
        });
        res.status(200).json({ ...channel.moveChannel });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.moveChannel = moveChannel;
const moveAllChannel = async (req, res, next) => {
    const server_id = res.locals.server_id;
    const { channels } = req.body;
    if (!server_id) {
        res.status(400).json({ message: "Server ID is required." });
        return;
    }
    if (!channels) {
        res.status(400).json({
            message: "An input of array of channels is required. Eg., channels: [channel_id, category_id, position]",
        });
        return;
    }
    if (!Array.isArray(channels)) {
        res
            .status(400)
            .json({ message: "Input of array of channels must be an array." });
        return;
    }
    try {
        const response = await (0, graphql_1.default)().request(mutations_1.channelMutations.MOVE_ALL_CHANNEL, {
            server_id,
            input: channels,
        });
        res.status(200).json({ ...response.moveAllChannel });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.moveAllChannel = moveAllChannel;
