"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteServerEmoji = exports.updateServerEmoji = exports.createServerEmoji = exports.getServerEmojis = exports.getServerEmoji = void 0;
const storage_1 = require("../../utils/storage");
const graphql_1 = __importDefault(require("../../utils/graphql"));
const queries_1 = require("../../graphql/queries");
const mutations_1 = require("../../graphql/mutations");
const log_1 = require("@/utils/log");
const _getServerEmojis = async (server_id) => {
    const response = await (0, graphql_1.default)().request(queries_1.serverEmojiQueries.GET_SERVER_EMOJIS, {
        server_id,
    });
    return response.serverEmojis;
};
const _getServerEmoji = async (server_id, emoji_id) => {
    const response = await (0, graphql_1.default)().request(queries_1.serverEmojiQueries.GET_SERVER_EMOJI, {
        server_id,
        emoji_id,
    });
    return response.serverEmoji;
};
const _countServerEmojis = async (server_id) => {
    const response = await (0, graphql_1.default)().request(queries_1.serverEmojiQueries.COUNT_SERVER_EMOJIS, {
        server_id,
    });
    return response.countServerEmojis;
};
const handleMongooseError = (error, error_code) => {
    const errors = error?.response?.errors;
    if (errors && errors.length > 0) {
        const errorMessage = errors[0].message;
        if (errorMessage.includes(error_code)) {
            return true;
        }
    }
    return false;
};
const getServerEmoji = async (req, res, next) => {
    const { serverId, emojiId } = req.params;
    if (!serverId || !emojiId) {
        res.status(400).json({ message: "Server ID and Emoji ID are required." });
        return;
    }
    try {
        const emoji = await _getServerEmoji(serverId, emojiId).catch(() => null);
        if (!emoji) {
            res.status(404).json({ message: "Emoji not found." });
            return;
        }
        res.status(200).json({ ...emoji });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.getServerEmoji = getServerEmoji;
const getServerEmojis = async (req, res, next) => {
    const { serverId } = req.params;
    if (!serverId) {
        res.status(400).json({ message: "Server ID is required." });
        return;
    }
    try {
        const emojis = await _getServerEmojis(serverId).catch(() => []);
        res.status(200).json(emojis);
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.getServerEmojis = getServerEmojis;
const createServerEmoji = async (req, res, next) => {
    const { serverId } = req.params;
    const user_id = res.locals.uid;
    const { name, image } = req.body;
    if (!serverId || !name || !image) {
        res
            .status(400)
            .json({ message: "Server ID, name, and image are required." });
        return;
    }
    try {
        const totalEmojis = await _countServerEmojis(serverId);
        log_1.log.debug(totalEmojis);
        if (totalEmojis >= 20) {
            res.status(400).json({ message: "Server emoji limit reached." });
            return;
        }
        const image_url = await (0, storage_1.processImage)(image, `emojis/${serverId}`);
        if (!image_url) {
            res.status(500).json({ message: "Failed to upload image." });
            return;
        }
        const emoji = await (0, graphql_1.default)().request(mutations_1.serverEmojiMutations.CREATE_SERVER_EMOJI, {
            input: {
                server_id: serverId,
                name,
                image_url: image_url,
                uploader_id: user_id,
            },
        });
        res
            .status(201)
            .json({ message: "Emoji created.", ...emoji.createServerEmoji });
        return;
    }
    catch (error) {
        if (handleMongooseError(error, 11000)) {
            res.status(400).json({ message: "Emoji name already exists." });
            return;
        }
        next(error);
        return;
    }
};
exports.createServerEmoji = createServerEmoji;
const updateServerEmoji = async (req, res, next) => {
    const { serverId, emojiId } = req.params;
    const { name } = req.body;
    if (!serverId || !emojiId || !name) {
        res
            .status(400)
            .json({ message: "Server ID, emoji ID, and name are required." });
        return;
    }
    try {
        const emoji = await _getServerEmoji(serverId, emojiId).catch(() => null);
        if (!emoji) {
            res.status(404).json({ message: "Emoji not found." });
            return;
        }
        await (0, graphql_1.default)().request(mutations_1.serverEmojiMutations.UPDATE_SERVER_EMOJI, {
            emoji_id: emojiId,
            name,
        });
        res.status(200).json({ message: "Emoji updated." });
        return;
    }
    catch (error) {
        if (handleMongooseError(error, 11000)) {
            res.status(400).json({ message: "Emoji name already exists." });
            return;
        }
        next(error);
        return;
    }
};
exports.updateServerEmoji = updateServerEmoji;
const deleteServerEmoji = async (req, res, next) => {
    const { serverId, emojiId } = req.params;
    if (!serverId || !emojiId) {
        res.status(400).json({ message: "Server ID and emoji ID are required." });
        return;
    }
    try {
        const emoji = await _getServerEmoji(serverId, emojiId).catch(() => null);
        if (!emoji) {
            res.status(404).json({ message: "Emoji not found." });
            return;
        }
        await (0, graphql_1.default)().request(mutations_1.serverEmojiMutations.DELETE_SERVER_EMOJI, {
            emoji_id: emojiId,
        });
        res.status(200).json({ message: "Emoji deleted." });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.deleteServerEmoji = deleteServerEmoji;
