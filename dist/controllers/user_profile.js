"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProfile = exports.updateProfile = exports.createProfile = exports.getProfileByUsername = exports.getProfile = void 0;
const storage_1 = require("../utils/storage");
const graphql_1 = __importDefault(require("../utils/graphql"));
const queries_1 = require("../graphql/queries");
const mutations_1 = require("../graphql/mutations");
const getUserProfile = async (userId, serverId) => {
    const response = await (0, graphql_1.default)().request(queries_1.userProfileQueries.GET_USER_PROFILE, {
        user_id: userId,
        server_id: serverId,
    });
    return response.getUserProfile;
};
const getProfile = async (req, res, next) => {
    const userId = req.params?.userId ?? res.locals.uid;
    const serverId = req.params?.serverId ?? null;
    if (!userId) {
        res.status(400).json({ message: "User ID is required." });
        return;
    }
    try {
        const profile = await getUserProfile(userId, serverId).catch(() => null);
        if (!profile) {
            res.status(404).json({ message: "Profile not found." });
            return;
        }
        res.status(200).json({ ...profile });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.getProfile = getProfile;
const getProfileByUsername = async (req, res, next) => {
    const username = req.params?.username;
    if (!username) {
        res.status(400).json({ message: "Username is required." });
        return;
    }
    try {
        const response = await (0, graphql_1.default)().request(queries_1.userProfileQueries.GET_USER_PROFILE_BY_USERNAME, {
            username,
        });
        if (!response.getUserProfileByUsername) {
            res
                .status(404)
                .json({ message: "Profile with matching username not found." });
            return;
        }
        res.status(200).json({ ...response.getUserProfileByUsername });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.getProfileByUsername = getProfileByUsername;
const createProfile = async (req, res, next) => {
    const userId = res.locals.uid;
    const serverId = req.params?.serverId ?? null;
    if (!userId) {
        res.status(500).json({
            message: "Server error: User ID is not assigned yet. Please contact the server owner.",
        });
        return;
    }
    const { display_name, about_me } = req.body;
    try {
        const response = await (0, graphql_1.default)().request(mutations_1.userProfileMutation.CREATE_USER_PROFILE, {
            input: {
                user_id: userId,
                server_id: serverId,
                display_name,
                about_me,
            },
        });
        res.status(200).json({ ...response });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.createProfile = createProfile;
const updateProfile = async (req, res, next) => {
    const userId = res.locals.uid;
    const serverId = req.params?.serverId ?? null;
    if (!userId) {
        res.status(500).json({
            message: "Server error: User ID is not assigned yet. Please contact the server owner.",
        });
        return;
    }
    const { display_name, about_me, avatar, banner } = req.body;
    let avatar_url = null;
    let banner_url = null;
    if (avatar) {
        avatar_url = await (0, storage_1.processImage)(avatar, "avatars");
        if (!avatar_url) {
            res
                .status(400)
                .json({ message: "Failed to upload avatar. Maybe check file type." });
            return;
        }
    }
    if (banner) {
        banner_url = await (0, storage_1.processImage)(banner, "banners");
        if (!banner_url) {
            res
                .status(400)
                .json({ message: "Failed to upload banner.  Maybe check file type." });
            return;
        }
    }
    const input = {
        ...(display_name && { display_name }),
        ...(about_me && { about_me }),
        ...(avatar_url && { avatar_url }),
        ...(banner_url && { banner_url }),
    };
    try {
        const response = await (0, graphql_1.default)().request(mutations_1.userProfileMutation.UPDATE_USER_PROFILE, {
            input: {
                user_id: userId,
                server_id: serverId,
                ...input,
            },
        });
        res.status(200).json({ ...response });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.updateProfile = updateProfile;
const deleteProfile = async (req, res, next) => {
    const userId = res.locals.uid;
    const serverId = req.params?.serverId ?? null;
    if (!userId) {
        res.status(400).json({ message: "User ID is required." });
        return;
    }
    try {
        const response = await (0, graphql_1.default)().request(mutations_1.userProfileMutation.DELETE_USER_PROFILE, {
            user_id: userId,
            server_id: serverId,
        });
        res.status(200).json({ ...response });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.deleteProfile = deleteProfile;
