"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatusText = exports.updateStatusType = exports.getMultipleUserStatus = exports.getUserStatus = exports.getCurrentUserStatus = void 0;
const graphql_1 = __importDefault(require("../utils/graphql"));
const queries_1 = require("../graphql/queries");
const mutations_1 = require("../graphql/mutations");
const getCurrentUserStatus = async (req, res, next) => {
    try {
        const { uid } = res.locals;
        const userStatus = await (0, graphql_1.default)().request(queries_1.userStatusQueries.GET_USER_STATUS, {
            user_id: uid,
        });
        res.status(200).json(userStatus.getUserStatus);
    }
    catch (error) {
        next(error);
    }
};
exports.getCurrentUserStatus = getCurrentUserStatus;
const getUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userStatus = await (0, graphql_1.default)().request(queries_1.userStatusQueries.GET_USER_STATUS, {
            user_id: id,
        });
        res.status(200).json(userStatus.getUserStatus);
    }
    catch (error) {
        next(error);
    }
};
exports.getUserStatus = getUserStatus;
const getMultipleUserStatus = async (req, res, next) => {
    try {
        const { user_ids } = req.body;
        const userStatuses = await (0, graphql_1.default)().request(queries_1.userStatusQueries.GET_MULTIPLE_USER_STATUS, {
            user_ids,
        });
        res.status(200).json(userStatuses.getMultipleUserStatus);
    }
    catch (error) {
        next(error);
    }
};
exports.getMultipleUserStatus = getMultipleUserStatus;
const updateStatusType = async (req, res, next) => {
    try {
        const { uid: user_id } = res.locals;
        const { type } = req.body;
        const { updateStatusType: response } = await (0, graphql_1.default)().request(mutations_1.userStatusMutations.UPDATE_USER_STATUS_TYPE, {
            user_id,
            type,
        });
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.updateStatusType = updateStatusType;
const updateStatusText = async (req, res, next) => {
    try {
        const { uid: user_id } = res.locals;
        const { status_text } = req.body;
        const { updateStatusText: response } = await (0, graphql_1.default)().request(mutations_1.userStatusMutations.UPDATE_USER_STATUS_TEXT, {
            user_id,
            status_text,
        });
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.updateStatusText = updateStatusText;
