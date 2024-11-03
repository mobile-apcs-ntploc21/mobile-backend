"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setFavoriteServer = exports.moveServer = exports.deleteInviteCode = exports.createInviteCode = exports.getInviteCode = exports.transferOwnership = exports.deleteServer = exports.updateServer = exports.createServer = exports.getUserServers = exports.getServer = void 0;
const storage_1 = require("../../utils/storage");
const graphql_1 = __importDefault(require("../../utils/graphql"));
const queries_1 = require("../../graphql/queries");
const mutations_1 = require("../../graphql/mutations");
const log_1 = require("@/utils/log");
const getServerOverview = async (server_id) => {
    const response = await (0, graphql_1.default)().request(queries_1.serverQueries.GET_SERVER_BY_ID, {
        server_id,
    });
    return response.server;
};
const getServersByUserId = async (userId) => {
    const response = await (0, graphql_1.default)().request(queries_1.serverQueries.GET_SERVERS_BY_USER_ID, {
        user_id: userId,
    });
    return response.servers;
};
const getServer = async (req, res, next) => {
    const server_id = req.params?.serverId;
    if (!server_id) {
        res.status(400).json({ message: "Server ID is required." });
        return;
    }
    try {
        const server = await getServerOverview(server_id).catch(() => null);
        if (!server) {
            res.status(404).json({ message: "Server not found." });
            return;
        }
        res.status(200).json({ ...server });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.getServer = getServer;
const getUserServers = async (req, res, next) => {
    const user_id = res.locals.uid;
    try {
        const servers = await getServersByUserId(user_id).catch(() => null);
        servers.sort((a, b) => a.position - b.position);
        servers.forEach((server, index) => {
            server.position = index;
        });
        res.status(200).json({ ...servers });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.getUserServers = getUserServers;
const createServer = async (req, res, next) => {
    const { name, avatar, banner } = req.body;
    const user_id = res.locals.uid;
    if (!name) {
        res.status(400).json({ message: "Name for the server is required." });
        return;
    }
    try {
        let avatar_url = null;
        let banner_url = null;
        if (avatar) {
            avatar_url = await (0, storage_1.processImage)(avatar, "servers");
        }
        if (banner) {
            banner_url = await (0, storage_1.processImage)(banner, "servers");
        }
        const response = await (0, graphql_1.default)().request(mutations_1.serverMutations.CREATE_SERVER, {
            input: {
                name,
                owner_id: user_id,
                avatar_url: avatar_url,
                banner_url: banner_url,
            },
        });
        res.status(201).json({ ...response.createServer });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.createServer = createServer;
const updateServer = async (req, res, next) => {
    const server_id = req.params?.serverId;
    const user_token = res.locals.token;
    const { name, avatar, banner } = req.body;
    if (!server_id) {
        res.status(400).json({ message: "Server ID is required." });
        return;
    }
    try {
        const input = {
            ...(name && { name }),
            ...(avatar && { avatar_url: await (0, storage_1.processImage)(avatar, "avatars") }),
            ...(banner && { banner_url: await (0, storage_1.processImage)(banner, "banners") }),
        };
        const response = await (0, graphql_1.default)(user_token).request(mutations_1.serverMutations.UPDATE_SERVER, {
            server_id: server_id,
            input: input,
        });
        res.status(200).json({ ...response.updateServer });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.updateServer = updateServer;
const deleteServer = async (req, res, next) => {
    const serverId = req.params?.serverId;
    const user_token = res.locals.token;
    if (!serverId) {
        res.status(400).json({ message: "Server ID is required." });
        return;
    }
    const server = await getServerOverview(serverId).catch(() => null);
    if (!server) {
        res.status(404).json({ message: "Server not found." });
        return;
    }
    if (server.owner !== res.locals.uid) {
        res
            .status(403)
            .json({ message: "You don't have permission to delete this server." });
        return;
    }
    try {
        const response = await (0, graphql_1.default)(user_token).request(mutations_1.serverMutations.DELETE_SERVER, {
            server_id: serverId,
        });
        res.status(200).json({ message: "Server deleted successfully" });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.deleteServer = deleteServer;
const transferOwnership = async (req, res, next) => {
    const server_id = req.params?.serverId;
    const { user_id } = req.body;
    const user_token = res.locals.token;
    if (!server_id || !user_id) {
        res.status(400).json({ message: "Server ID and User ID are required." });
        return;
    }
    if (user_id === res.locals.uid) {
        res
            .status(400)
            .json({ message: "You can't transfer ownership to yourself." });
        return;
    }
    try {
        const response = await (0, graphql_1.default)(user_token).request(mutations_1.serverMutations.TRANSFER_OWNERSHIP, {
            server_id: server_id,
            user_id: user_id,
        });
        res.status(200).json({ message: "Ownership transferred successfully" });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.transferOwnership = transferOwnership;
const getInviteCode = async (req, res, next) => {
    const server_id = req.params?.serverId;
    const user_token = res.locals.token;
    if (!server_id) {
        res.status(400).json({ message: "Server ID is required." });
        return;
    }
    try {
        const response = await (0, graphql_1.default)(user_token).request(queries_1.serverQueries.GET_INVITE_CODE, {
            server_id: server_id,
        });
        res.status(200).json({ ...response.getInviteCode });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.getInviteCode = getInviteCode;
const createInviteCode = async (req, res, next) => {
    const server_id = req.params?.serverId;
    const user_token = res.locals.token;
    const { customUrl, expiredAt, maxUses } = req.body;
    let url = null;
    if (!server_id) {
        res.status(400).json({ message: "Server ID is required." });
        return;
    }
    if (customUrl) {
        url = `https://fbi.com/invite/${customUrl}`;
    }
    else {
        const base = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        url = "https://fbi.com/invite/";
        for (let i = 0; i < 10; i++) {
            url += base.charAt(Math.floor(Math.random() * base.length));
        }
    }
    try {
        const response = await (0, graphql_1.default)(user_token).request(mutations_1.serverMutations.CREATE_INVITE_CODE, {
            server_id: server_id,
            input: {
                url,
                expiredAt,
                maxUses,
            },
        });
        res.status(201).json({ ...response.createInviteCode });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.createInviteCode = createInviteCode;
const deleteInviteCode = async (req, res, next) => {
    const server_id = req.params?.serverId;
    const user_token = res.locals.token;
    const { url } = req.body;
    if (!server_id || !url) {
        res.status(400).json({ message: "Server ID and URL are required." });
        return;
    }
    try {
        const response = await (0, graphql_1.default)(user_token).request(mutations_1.serverMutations.DELETE_INVITE_CODE, {
            server_id: server_id,
            url: url,
        });
        res.status(200).json({ message: "Invite code deleted successfully" });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.deleteInviteCode = deleteInviteCode;
const moveServer = async (req, res, next) => {
    const { servers } = req.body;
    const user_id = res.locals.uid;
    if (!servers) {
        res.status(400).json({ message: "Servers are required." });
        return;
    }
    if (!user_id) {
        res.status(400).json({ message: "User ID is required." });
        return;
    }
    try {
        const response = await (0, graphql_1.default)().request(mutations_1.serverMutations.MOVE_SERVER, {
            user_id: user_id,
            input: servers,
        });
        if (!response) {
            res.status(400).json({ message: "Failed to move servers." });
            return;
        }
        res.status(200).json({ message: "Servers moved successfully" });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.moveServer = moveServer;
const setFavoriteServer = async (req, res, next) => {
    log_1.log.info("setFavoriteServer");
    const is_favorite = req.body?.is_favorite ?? undefined;
    const server_id = req.params?.serverId;
    const user_id = res.locals.uid;
    if (!server_id) {
        res
            .status(400)
            .json({ message: "Server ID and is_favorite are required." });
        return;
    }
    try {
        const input = {
            user_id,
            server_id,
        };
        if (is_favorite !== undefined) {
            input.is_favorite = is_favorite;
        }
        const response = await (0, graphql_1.default)().request(mutations_1.serverMutations.SET_FAVORITE_SERVER, input);
        if (!response) {
            res.status(400).json({ message: "Failed to update favorite." });
            return;
        }
        res.status(200).json({ message: "Server favorite updated" });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.setFavoriteServer = setFavoriteServer;
