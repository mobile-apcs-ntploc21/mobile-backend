"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetSettings = exports.deleteSettings = exports.updateSettings = exports.createSettings = exports.getSettings = void 0;
const graphql_1 = __importDefault(require("../utils/graphql"));
const mutations_1 = require("../graphql/mutations");
const queries_1 = require("../graphql/queries");
const getUserSettings = async (user_id) => {
    const response = await (0, graphql_1.default)().request(queries_1.settingsQueries.GET_USER_SETTINGS, {
        user_id: user_id,
    });
    return response.getUserSettings;
};
const getSettings = async (req, res, next) => {
    const currentUser = res.locals.uid;
    try {
        const settings = await getUserSettings(currentUser).catch(() => null);
        let parsedSettings = null;
        try {
            parsedSettings = JSON.parse(settings.settings);
        }
        catch (error) {
            res.status(400).json({ message: "Settings is not in JSON format !" });
            return;
        }
        res.status(200).json({ ...parsedSettings });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.getSettings = getSettings;
const createSettings = async (req, res, next) => {
    const currentUser = res.locals.uid;
    const { settings } = req.body;
    const parsedSettings = null;
    try {
        const response = await (0, graphql_1.default)().request(mutations_1.settingsMutations.CREATE_USER_SETTINGS, {
            input: {
                user_id: currentUser,
                settings: JSON.stringify(req.body),
            },
        });
        res.status(200).json({
            message: "Settings created successfully !",
            settings: parsedSettings,
        });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.createSettings = createSettings;
const updateSettings = async (req, res, next) => {
    const currentUser = res.locals.uid;
    try {
        const response = await (0, graphql_1.default)().request(mutations_1.settingsMutations.UPDATE_USER_SETTINGS, {
            input: {
                user_id: currentUser,
                settings: JSON.stringify(req.body),
            },
        });
        res.status(200).json({
            message: "Settings updated successfully !",
            settings: req.body,
        });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.updateSettings = updateSettings;
const deleteSettings = async (req, res, next) => {
    const currentUser = res.locals.uid;
    try {
        const response = await (0, graphql_1.default)().request(mutations_1.settingsMutations.DELETE_USER_SETTINGS, {
            user_id: currentUser,
        });
        res.status(200).json({ message: "Settings deleted successfully !" });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.deleteSettings = deleteSettings;
const resetSettings = async (req, res, next) => {
    const currentUser = res.locals.uid;
    try {
        const response = await (0, graphql_1.default)().request(mutations_1.settingsMutations.RESTORE_USER_SETTINGS, {
            user_id: currentUser,
        });
        const parsedSettings = JSON.parse(response.restoreUserSettings.settings);
        res.status(200).json({
            message: "Settings restored successfully !",
            settings: parsedSettings,
        });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
};
exports.resetSettings = resetSettings;
