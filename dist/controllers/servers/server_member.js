"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeSelf = exports.removeMembers = exports.addMembers = exports.joinServer = exports.getServerMembers = void 0;
const graphql_1 = __importDefault(require("../../utils/graphql"));
const queries_1 = require("../../graphql/queries");
const mutations_1 = require("../../graphql/mutations");
const getServerMembers = async (req, res, next) => {
    const { serverId } = req.params;
    const { limit } = req.query;
    try {
        const { getServerMembers: members } = await (0, graphql_1.default)().request(queries_1.serverMemberQueries.GET_SERVER_MEMBERS, {
            server_id: serverId,
            limit: Number(limit) || 1000,
        });
        if (members.length === 0) {
            res.json([]);
            return;
        }
        res.status(200).json(members);
    }
    catch (error) {
        next(error);
    }
};
exports.getServerMembers = getServerMembers;
const joinServer = async (req, res, next) => {
    const { url } = req.body;
    const { uid } = res.locals;
    try {
        const response = await (0, graphql_1.default)().request(mutations_1.serverMemberMutations.JOIN_SERVER, {
            url,
            user_id: uid,
        });
        res.json(response.joinServer);
    }
    catch (error) {
        next(error);
    }
};
exports.joinServer = joinServer;
const addMembers = async (req, res, next) => {
    const { user_ids } = req.body;
    const { serverId } = req.params;
    try {
        const { addServerMembers: response } = await (0, graphql_1.default)().request(mutations_1.serverMemberMutations.ADD_SERVER_MEMBERS, {
            input: { server_id: serverId, user_ids },
        });
        res.json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.addMembers = addMembers;
const removeMembers = async (req, res, next) => {
    const { user_ids } = req.body;
    const { serverId } = req.params;
    try {
        const { removeServerMembers: response } = await (0, graphql_1.default)().request(mutations_1.serverMemberMutations.REMOVE_SERVER_MEMBERS, {
            input: { server_id: serverId, user_ids },
        });
        res.json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.removeMembers = removeMembers;
const removeSelf = async (req, res, next) => {
    const { uid } = res.locals;
    const { serverId } = req.params;
    try {
        const { removeServerMembers: response } = await (0, graphql_1.default)().request(mutations_1.serverMemberMutations.REMOVE_SERVER_MEMBERS, {
            input: { server_id: serverId, user_ids: [uid] },
        });
        res.json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.removeSelf = removeSelf;
