"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unreactMessage = exports.reactMessage = exports.unpinMessage = exports.pinMessage = exports.deleteMessage = exports.editMessage = exports.createMessage = exports.getReactions = exports.getPinnedMessages = exports.searchMessages = exports.getMessages = exports.getMessage = void 0;
const graphql_1 = __importDefault(require("../../utils/graphql"));
const queries_1 = require("../../graphql/queries");
const mutations_1 = require("../../graphql/mutations");
const user_regex = /<@!?([a-f0-9]{24})>/g;
const role_regex = /<@&([a-f0-9]{24})>/g;
const channel_regex = /<#([a-f0-9]{24})>/g;
const emoji_regex = /<:(.*?):([a-f0-9]{24})>/g;
function getMatches(string, regex, index) {
    const matches = [];
    let match;
    while ((match = regex.exec(string))) {
        matches.push(match[index]);
    }
    return matches;
}
const _getMessage = async (message_id) => {
    if (!message_id) {
        throw new Error("Message ID is required.");
    }
    try {
        const { message } = await (0, graphql_1.default)().request(queries_1.messageQueries.GET_MESSAGE, {
            message_id,
        });
        return message;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
const _getReactions = async (message_id) => {
    if (!message_id) {
        throw new Error("Message ID is required.");
    }
    try {
        const { reactions } = await (0, graphql_1.default)().request(queries_1.messageQueries.GET_REACTIONS, {
            message_id,
        });
        return reactions;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
const getMessage = async (req, res, next) => {
    const { messageId: message_id } = req.params;
    try {
        const message = await _getMessage(message_id);
        if (!message) {
            res.status(404).json({ message: "Message not found." });
            return;
        }
        res.status(200).json({ message });
    }
    catch (error) {
        next(error);
    }
};
exports.getMessage = getMessage;
const getMessages = async (req, res, next) => {
    const { channelId } = req.params;
    const { limit } = req.query;
    const { before, after, around } = req.query;
    if (!channelId) {
        res.status(400).json({ message: "Channel ID is required." });
        return;
    }
    if (limit && isNaN(parseInt(limit))) {
        res.status(400).json({ message: "Limit must be a number." });
        return;
    }
    const channel = res.locals.channelObject;
    if (!channel.conversation_id) {
        res.status(404).json({
            message: "Channel does not have a conversation. Please delete and create a new channel.",
        });
        return;
    }
    try {
        const requestBody = {
            conversation_id: channel.conversation_id,
            limit: parseInt(limit) || 50,
            before: before,
            after: after,
            around: around,
        };
        const { messages } = await (0, graphql_1.default)().request(queries_1.messageQueries.GET_MESSAGES, requestBody);
        if (!messages) {
            res.status(200).json({ messages: [] });
            return;
        }
        res.status(200).json({ messages });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.getMessages = getMessages;
const searchMessages = async (req, res, next) => {
    const { serverId } = req.params;
    const { page, limit } = req.query;
    const { content, author_id: _author_id, mentions: _mentions, has, in: _inChannel, conversationIds, } = req.query;
    if (!req.query) {
        res.status(400).json({ message: "Query is required." });
        return;
    }
    const inChannel = Array.isArray(_inChannel) ? _inChannel : [_inChannel];
    const inConversation = Array.isArray(conversationIds)
        ? conversationIds
        : [conversationIds];
    const author_id = _author_id
        ? Array.isArray(_author_id)
            ? _author_id
            : [_author_id]
        : [];
    const mentions = _mentions
        ? Array.isArray(_mentions)
            ? _mentions
            : [_mentions]
        : [];
    if (inChannel.length === 0 && inConversation.length === 0) {
        res.status(400).json({
            message: "At least one channel or conversation ID is required.\r\n Global search is not yet supported.",
        });
        return;
    }
    try {
        const requestBody = {
            query: {
                text: content,
                inChannel: inChannel,
                inConversation: inConversation,
                from: author_id,
                mention: mentions,
                has: has,
            },
            offset: (parseInt(page) - 1) * 25 || 0,
            limit: parseInt(limit) || 25,
        };
        const { searchMessages: messages } = await (0, graphql_1.default)().request(queries_1.messageQueries.SEARCH_MESSAGES, requestBody);
        if (!messages) {
            res.status(200).json({ messages: [] });
            return;
        }
        res.status(200).json({ messages });
    }
    catch (error) {
        next(error);
    }
};
exports.searchMessages = searchMessages;
const getPinnedMessages = async (req, res, next) => {
    const { channelId } = req.params;
    if (!channelId) {
        res.status(400).json({ message: "Channel ID is required." });
        return;
    }
    const channel = res.locals.channelObject;
    if (!channel.conversation_id) {
        res.status(404).json({
            message: "Channel does not have a conversation. Please delete and create a new channel.",
        });
        return;
    }
    try {
        const { pinnedMessages: messages } = await (0, graphql_1.default)().request(queries_1.messageQueries.GET_PINNED_MESSAGES, {
            conversation_id: channel.conversation_id,
        });
        if (!messages) {
            res.status(200).json({ messages: [] });
            return;
        }
        res.status(200).json({ messages });
    }
    catch (error) {
        next(error);
    }
};
exports.getPinnedMessages = getPinnedMessages;
const getReactions = async (req, res, next) => {
    const { messageId: message_id } = req.params;
    try {
        const reactions = await _getReactions(message_id);
        if (!reactions) {
            res.status(404).json({ message: "Reactions not found." });
            return;
        }
        res.status(200).json({ reactions });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.getReactions = getReactions;
const createMessage = async (req, res, next) => {
    const { channelId } = req.params;
    const { content, repliedMessageId, forwardedMessageId } = req.body;
    if (!channelId) {
        res.status(400).json({ message: "Channel ID is required." });
        return;
    }
    if (!content) {
        res.status(400).json({ message: "Content is required." });
        return;
    }
    if (content.length > 2000) {
        res.status(400).json({
            message: "Content must be less than or equal to 2000 characters.",
        });
        return;
    }
    const channel = res.locals.channelObject;
    if (!channel.conversation_id) {
        res.status(404).json({
            message: "Channel does not have a conversation. Please delete and create a new channel.",
        });
        return;
    }
    const mention_users = getMatches(content, user_regex, 1);
    const mention_roles = getMatches(content, role_regex, 1);
    const mention_channels = getMatches(content, channel_regex, 1);
    const emojis = getMatches(content, emoji_regex, 2);
    try {
        const requestBody = {
            conversation_id: channel.conversation_id,
            input: {
                sender_id: res.locals.uid,
                content,
                mention_users: mention_users,
                mention_roles: mention_roles,
                mention_channels: mention_channels,
                emojis: emojis,
                replied_message_id: repliedMessageId || null,
                forwarded_message_id: forwardedMessageId || null,
            },
        };
        const { createMessage: message } = await (0, graphql_1.default)().request(mutations_1.messageMutations.CREATE_MESSAGE, requestBody);
        res.status(201).json({ message });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.createMessage = createMessage;
const editMessage = async (req, res, next) => {
    const { messageId: message_id } = req.params;
    const { content } = req.body;
    if (!message_id) {
        res.status(400).json({ message: "Message ID is required." });
        return;
    }
    const message = await _getMessage(message_id).catch(() => null);
    if (!message) {
        res.status(404).json({ message: "Message not found." });
        return;
    }
    if (message.sender_id !== res.locals.uid) {
        const permissions = res.locals.userChannelPermissions;
        if (!permissions || permissions?.MANAGE_MESSAGE !== "ALLOWED") {
            res.status(403).json({
                message: "You do not have permission to edit this message.",
            });
            return;
        }
    }
    if (!content) {
        res.status(400).json({ message: "Content is required." });
        return;
    }
    const mention_users = getMatches(content, user_regex, 1);
    const mention_roles = getMatches(content, role_regex, 1);
    const mention_channels = getMatches(content, channel_regex, 1);
    const emojis = getMatches(content, emoji_regex, 2);
    try {
        const requestBody = {
            message_id,
            input: {
                content,
                mention_users: mention_users,
                mention_roles: mention_roles,
                mention_channels: mention_channels,
                emojis: emojis,
            },
        };
        const { editMessage: message } = await (0, graphql_1.default)().request(mutations_1.messageMutations.UPDATE_MESSAGE, requestBody);
        res.status(200).json({ message });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.editMessage = editMessage;
const deleteMessage = async (req, res, next) => {
    const { messageId: message_id, serverId, channelId } = req.params;
    if (!message_id) {
        res.status(400).json({ message: "Message ID is required." });
        return;
    }
    const message = await _getMessage(message_id).catch(() => null);
    if (!message) {
        res.status(404).json({ message: "Message not found." });
        return;
    }
    if (message.sender_id !== res.locals.uid) {
        const permissions = res.locals.userChannelPermissions;
        if (!permissions || permissions?.MANAGE_MESSAGE !== "ALLOWED") {
            res.status(403).json({
                message: "You do not have permission to delete this message.",
            });
            return;
        }
    }
    try {
        const { deleteMessage: deleted } = await (0, graphql_1.default)().request(mutations_1.messageMutations.DELETE_MESSAGE, {
            message_id,
        });
        res.status(200).json({ deleted });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.deleteMessage = deleteMessage;
const pinMessage = async (req, res, next) => {
    const { messageId: message_id } = req.params;
    if (!message_id) {
        res.status(400).json({ message: "Message ID is required." });
        return;
    }
    try {
        const { pinMessage: pinned } = await (0, graphql_1.default)().request(mutations_1.messageMutations.PIN_MESSAGE, {
            message_id,
        });
        res.status(200).json({ pinned });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.pinMessage = pinMessage;
const unpinMessage = async (req, res, next) => {
    const { messageId: message_id } = req.params;
    if (!message_id) {
        res.status(400).json({ message: "Message ID is required." });
        return;
    }
    try {
        const { unpinMessage: unpinned } = await (0, graphql_1.default)().request(mutations_1.messageMutations.UNPIN_MESSAGE, {
            message_id,
        });
        res.status(200).json({ unpinned });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.unpinMessage = unpinMessage;
const reactMessage = async (req, res, next) => {
    const { messageId: message_id } = req.params;
    const { emoji_id } = req.body;
    if (!message_id) {
        res.status(400).json({ message: "Message ID is required." });
        return;
    }
    if (!emoji_id) {
        res.status(400).json({ message: "Emoji is required." });
        return;
    }
    try {
        const { reactMessage: reactions } = await (0, graphql_1.default)().request(mutations_1.messageMutations.REACT_MESSAGE, {
            message_id,
            input: {
                sender_id: res.locals.uid,
                emoji: emoji_id,
            },
        });
        res.status(200).json({ reactions });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.reactMessage = reactMessage;
const unreactMessage = async (req, res, next) => {
    const { messageId: message_id } = req.params;
    const { emoji_id } = req.body;
    if (!message_id) {
        res.status(400).json({ message: "Message ID is required." });
        return;
    }
    if (!emoji_id) {
        res.status(400).json({ message: "Emoji is required." });
        return;
    }
    try {
        const { unreactMessage: reactions } = await (0, graphql_1.default)().request(mutations_1.messageMutations.UNREACT_MESSAGE, {
            message_id,
            input: {
                sender_id: res.locals.uid,
                emoji: emoji_id,
            },
        });
        res.status(200).json({ reactions });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.unreactMessage = unreactMessage;
