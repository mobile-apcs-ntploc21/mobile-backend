"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelationshipTypeApi = exports.getBlockedUsers = exports.getSentFriendRequests = exports.getReceivedFriendRequests = exports.getAllFriends = exports.unblockUser = exports.blockUser = exports.removeFriend = exports.cancelReceivedFriendRequest = exports.cancelFriendRequest = exports.acceptFriend = exports.addFriend = void 0;
const graphql_1 = __importDefault(require("../utils/graphql"));
const queries_1 = require("../graphql/queries");
const mutations_1 = require("../graphql/mutations");
const log_1 = require("@/utils/log");
const getRelationshipType = async (user_first_id, user_second_id) => {
    if (user_first_id > user_second_id) {
        const temp = user_first_id;
        user_first_id = user_second_id;
        user_second_id = temp;
    }
    const { getRelationshipType: response } = await (0, graphql_1.default)().request(queries_1.GET_RELATIONSHIP_TYPE, {
        user_first_id: user_first_id,
        user_second_id: user_second_id,
    });
    return response;
};
const deleteRelationship = async (user_first_id, user_second_id) => {
    if (user_first_id > user_second_id) {
        const temp = user_first_id;
        user_first_id = user_second_id;
        user_second_id = temp;
    }
    return await (0, graphql_1.default)().request(mutations_1.DELETE_RELATIONSHIP, {
        user_first_id: user_first_id,
        user_second_id: user_second_id,
    });
};
const addFriend = async (req, res, next) => {
    try {
        const current_user = res.locals.uid;
        const friend = req.params.id;
        if (current_user == friend) {
            res.status(400).json({
                message: "You cannot add yourself as a friend.",
            });
            return;
        }
        let user_first_id = current_user;
        let user_second_id = friend;
        if (current_user > friend) {
            user_first_id = friend;
            user_second_id = current_user;
        }
        const relationshipType = await getRelationshipType(user_first_id, user_second_id)
            .then((res) => {
            return res;
        })
            .catch((err) => {
            return null;
        });
        if (relationshipType) {
            res.status(400).json({
                message: "You cannot add this user as a friend.",
            });
            return;
        }
        if (user_first_id == current_user) {
            const response = await (0, graphql_1.default)().request(mutations_1.CREATE_RELATIONSHIP, {
                user_first_id: current_user,
                user_second_id: friend,
                type: "PENDING_FIRST_SECOND",
            });
        }
        else {
            const response = await (0, graphql_1.default)().request(mutations_1.CREATE_RELATIONSHIP, {
                user_first_id: friend,
                user_second_id: current_user,
                type: "PENDING_SECOND_FIRST",
            });
        }
        res.status(200).json({
            message: "Friend request sent.",
        });
    }
    catch (error) {
        res.status(500).json({
            message: error.message,
        });
        return;
    }
};
exports.addFriend = addFriend;
const acceptFriend = async (req, res, next) => {
    try {
        const current_user = res.locals.uid;
        const friend = req.params.id;
        if (current_user == friend) {
            res.status(400).json({
                message: "You cannot accept yourself as a friend.",
            });
            return;
        }
        let user_first_id = current_user;
        let user_second_id = friend;
        if (current_user > friend) {
            user_first_id = friend;
            user_second_id = current_user;
        }
        const relationshipType = await getRelationshipType(current_user, friend)
            .then((res) => {
            return res;
        })
            .catch((err) => {
            return null;
        });
        if (!relationshipType) {
            res.status(400).json({
                message: "You cannot accept this user as a friend.",
            });
            return;
        }
        if (user_first_id == current_user &&
            relationshipType == "PENDING_SECOND_FIRST") {
            const response = await (0, graphql_1.default)().request(mutations_1.UPDATE_RELATIONSHIP, {
                user_first_id: current_user,
                user_second_id: friend,
                type: "FRIEND",
            });
        }
        else if (user_first_id == friend &&
            relationshipType == "PENDING_FIRST_SECOND") {
            const response = await (0, graphql_1.default)().request(mutations_1.UPDATE_RELATIONSHIP, {
                user_first_id: friend,
                user_second_id: current_user,
                type: "FRIEND",
            });
        }
        else {
            res.status(400).json({
                message: "You cannot accept this user as a friend.",
            });
            return;
        }
        res.status(200).json({
            message: "Friend request accepted.",
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            message: error.message,
        });
        return;
    }
};
exports.acceptFriend = acceptFriend;
const cancelFriendRequest = async (req, res, next) => {
    try {
        const current_user = res.locals.uid;
        const friend = req.params.id;
        if (current_user == friend) {
            res.status(400).json({
                message: "You cannot cancel friend request to yourself.",
            });
            return;
        }
        const relationshipType = await getRelationshipType(current_user, friend)
            .then((res) => {
            return res;
        })
            .catch((err) => {
            return null;
        });
        if (!relationshipType) {
            res.status(400).json({
                message: "You cannot cancel friend request to this user.",
            });
            return;
        }
        if ((current_user < friend && relationshipType == "PENDING_FIRST_SECOND") ||
            (current_user > friend && relationshipType == "PENDING_SECOND_FIRST")) {
            const response = await deleteRelationship(current_user, friend);
        }
        else {
            res.status(400).json({
                message: "You cannot cancel friend request to this user.",
            });
            return;
        }
        res.status(200).json({
            message: "Friend request cancelled.",
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            message: error.message,
        });
        return;
    }
};
exports.cancelFriendRequest = cancelFriendRequest;
const cancelReceivedFriendRequest = async (req, res, next) => {
    try {
        const current_user = res.locals.uid;
        const friend = req.params.id;
        if (current_user == friend) {
            res.status(400).json({
                message: "You cannot cancel received friend request from yourself.",
            });
            return;
        }
        const relationshipType = await getRelationshipType(current_user, friend)
            .then((res) => {
            return res;
        })
            .catch((err) => {
            return null;
        });
        if (!relationshipType) {
            res.status(400).json({
                message: "You cannot cancel received friend request from this user.",
            });
            return;
        }
        if ((current_user > friend && relationshipType == "PENDING_FIRST_SECOND") ||
            (current_user < friend && relationshipType == "PENDING_SECOND_FIRST")) {
            const response = await deleteRelationship(current_user, friend);
        }
        else {
            res.status(400).json({
                message: "You cannot cancel received friend request from this user.",
            });
            return;
        }
        res.status(200).json({
            message: "Received friend request cancelled.",
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            message: error.message,
        });
        return;
    }
};
exports.cancelReceivedFriendRequest = cancelReceivedFriendRequest;
const removeFriend = async (req, res, next) => {
    try {
        const current_user = res.locals.uid;
        const friend = req.params.id;
        if (current_user == friend) {
            res.status(400).json({
                message: "You cannot remove yourself as a friend.",
            });
            return;
        }
        const relationshipType = await getRelationshipType(current_user, friend)
            .then((res) => {
            return res;
        })
            .catch((err) => {
            return null;
        });
        if (!relationshipType) {
            res.status(400).json({
                message: "You cannot remove this user as a friend.",
            });
            return;
        }
        if (relationshipType == "FRIEND") {
            const response = await deleteRelationship(current_user, friend);
        }
        else {
            res.status(400).json({
                message: "You cannot remove this user as a friend.",
            });
            return;
        }
        res.status(200).json({
            message: "Friend removed.",
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            message: error.message,
        });
        return;
    }
};
exports.removeFriend = removeFriend;
const blockUser = async (req, res, next) => {
    try {
        const current_user = res.locals.uid;
        const friend = req.params.id;
        if (current_user == friend) {
            res.status(400).json({
                message: "You cannot block yourself.",
            });
            return;
        }
        let user_first_id = current_user;
        let user_second_id = friend;
        if (current_user > friend) {
            user_first_id = friend;
            user_second_id = current_user;
        }
        const relationshipType = await getRelationshipType(user_first_id, user_second_id)
            .then((res) => {
            return res;
        })
            .catch((err) => {
            return null;
        });
        if ((user_first_id == current_user &&
            relationshipType == "BLOCK_FIRST_SECOND") ||
            (user_first_id == friend && relationshipType == "BLOCK_SECOND_FIRST")) {
            res.status(400).json({
                message: "You have already blocked this user.",
            });
            return;
        }
        if ((user_first_id == friend && relationshipType == "BLOCK_FIRST_SECOND") ||
            (user_first_id == current_user &&
                relationshipType == "BLOCK_SECOND_FIRST")) {
            res.status(400).json({
                message: "You have already been blocked by this user.",
            });
            return;
        }
        if (!relationshipType) {
            if (user_first_id == current_user) {
                const response = await (0, graphql_1.default)().request(mutations_1.CREATE_RELATIONSHIP, {
                    user_first_id: current_user,
                    user_second_id: friend,
                    type: "BLOCK_FIRST_SECOND",
                });
            }
            else {
                const response = await (0, graphql_1.default)().request(mutations_1.CREATE_RELATIONSHIP, {
                    user_first_id: friend,
                    user_second_id: current_user,
                    type: "BLOCK_SECOND_FIRST",
                });
            }
        }
        else {
            if (user_first_id == current_user) {
                const response = await (0, graphql_1.default)().request(mutations_1.UPDATE_RELATIONSHIP, {
                    user_first_id: current_user,
                    user_second_id: friend,
                    type: "BLOCK_FIRST_SECOND",
                });
            }
            else {
                const response = await (0, graphql_1.default)().request(mutations_1.UPDATE_RELATIONSHIP, {
                    user_first_id: friend,
                    user_second_id: current_user,
                    type: "BLOCK_SECOND_FIRST",
                });
            }
        }
        res.status(200).json({
            message: "User blocked.",
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            message: error.message,
        });
        return;
    }
};
exports.blockUser = blockUser;
const unblockUser = async (req, res, next) => {
    try {
        const current_user = res.locals.uid;
        const friend = req.params.id;
        if (current_user == friend) {
            res.status(400).json({
                message: "You cannot unblock yourself.",
            });
            return;
        }
        let user_first_id = current_user;
        let user_second_id = friend;
        if (current_user > friend) {
            user_first_id = friend;
            user_second_id = current_user;
        }
        const relationshipType = await getRelationshipType(user_first_id, user_second_id)
            .then((res) => {
            return res;
        })
            .catch((err) => {
            return null;
        });
        if (!relationshipType) {
            res.status(400).json({
                message: "You have not blocked this user.",
            });
            return;
        }
        if ((user_first_id == current_user &&
            relationshipType != "BLOCK_FIRST_SECOND") ||
            (user_first_id == friend && relationshipType != "BLOCK_SECOND_FIRST")) {
            res.status(400).json({
                message: "You have not blocked this user.",
            });
            return;
        }
        const response = await deleteRelationship(user_first_id, user_second_id);
        res.status(200).json({
            message: "User unblocked.",
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            message: error.message,
        });
        return;
    }
};
exports.unblockUser = unblockUser;
const getAllFriends = async (req, res, next) => {
    try {
        const user_id = res.locals.uid;
        const { getAllFriends: response } = await (0, graphql_1.default)().request(queries_1.GET_ALL_FRIENDS, {
            user_id: user_id,
        });
        res.status(200).json({
            friends: response,
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            message: error.message,
        });
        return;
    }
};
exports.getAllFriends = getAllFriends;
const getReceivedFriendRequests = async (req, res, next) => {
    try {
        const user_id = res.locals.uid;
        const { getReceivedFriendRequests: response } = await (0, graphql_1.default)().request(queries_1.GET_RECEIVED_FRIEND_REQUESTS, {
            user_id: user_id,
        });
        res.status(200).json({
            requests: response,
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            message: error.message,
        });
        return;
    }
};
exports.getReceivedFriendRequests = getReceivedFriendRequests;
const getSentFriendRequests = async (req, res, next) => {
    try {
        const user_id = res.locals.uid;
        log_1.log.debug(user_id);
        const { getSentFriendRequests: response } = await (0, graphql_1.default)().request(queries_1.GET_SENT_FRIEND_REQUESTS, {
            user_id: user_id,
        });
        res.status(200).json({
            requests: response,
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            message: error.message,
        });
        return;
    }
};
exports.getSentFriendRequests = getSentFriendRequests;
const getBlockedUsers = async (req, res, next) => {
    try {
        const user_id = res.locals.uid;
        const { getBlockedUsers: response } = await (0, graphql_1.default)().request(queries_1.GET_BLOCKED_USERS, {
            user_id: user_id,
        });
        res.status(200).json({
            blocked: response,
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            message: error.message,
        });
        return;
    }
};
exports.getBlockedUsers = getBlockedUsers;
const getRelationshipTypeApi = async (req, res, next) => {
    try {
        const current_user = res.locals.uid;
        const friend = req.params.id;
        let user_first_id = current_user;
        let user_second_id = friend;
        if (current_user > friend) {
            user_first_id = friend;
            user_second_id = current_user;
        }
        const relationshipType = await getRelationshipType(user_first_id, user_second_id)
            .then((res) => {
            return res;
        })
            .catch((err) => {
            return null;
        });
        if (!relationshipType) {
            res.status(200).json({ type: "NOT-FRIEND" });
            return;
        }
        if (user_first_id == current_user) {
            if (relationshipType == "PENDING_FIRST_SECOND") {
                res.status(200).json({ type: "REQUEST-SENT" });
                return;
            }
            else if (relationshipType == "PENDING_SECOND_FIRST") {
                res.status(200).json({ type: "REQUEST-RECEIVED" });
                return;
            }
            else if (relationshipType == "FRIEND") {
                res.status(200).json({ type: "FRIEND" });
                return;
            }
            else if (relationshipType == "BLOCK_FIRST_SECOND" ||
                relationshipType == "BLOCK_SECOND_FIRST") {
                res.status(200).json({ type: "BLOCK" });
                return;
            }
        }
        else {
            if (relationshipType == "PENDING_FIRST_SECOND") {
                res.status(200).json({ type: "REQUEST-RECEIVED" });
                return;
            }
            else if (relationshipType == "PENDING_SECOND_FIRST") {
                res.status(200).json({ type: "REQUEST-SENT" });
                return;
            }
            else if (relationshipType == "FRIEND") {
                res.status(200).json({ type: "FRIEND" });
                return;
            }
            else if (relationshipType == "BLOCK_SECOND_FIRST" ||
                relationshipType == "BLOCK_FIRST_SECOND") {
                res.status(200).json({ type: "BLOCK" });
                return;
            }
        }
        res.status(200).json({ type: "UNDEFINED" });
        return;
    }
    catch (error) {
        res.status(500).json({
            message: error.message,
        });
        return;
    }
};
exports.getRelationshipTypeApi = getRelationshipTypeApi;
