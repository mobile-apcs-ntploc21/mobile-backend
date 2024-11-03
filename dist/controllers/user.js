"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.getMe = exports.refresh = exports.loginUser = exports.createUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const graphql_1 = __importDefault(require("../utils/graphql"));
const mutations_1 = require("../graphql/mutations");
const queries_1 = require("../graphql/queries");
const config_1 = __importDefault(require("../config"));
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, config_1.default.JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: config_1.default.JWT_EXPIRES_IN,
    });
};
const generateRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, config_1.default.JWT_REFRESH_SECRET, {
        algorithm: "HS256",
        expiresIn: config_1.default.JWT_REFRESH_EXPIRES_IN,
    });
};
const getUserByEmail = async (email) => {
    const response = await (0, graphql_1.default)().request(queries_1.GET_USER_BY_EMAIL, {
        email: email,
    });
    return response.getUserByEmail;
};
const getUserByUsername = async (username) => {
    const response = await (0, graphql_1.default)().request(queries_1.GET_USER_BY_USERNAME, {
        username: username,
    });
    return response.getUserByUsername;
};
const createUser = async (req, res, next) => {
    try {
        const { username, email, password, phone: phoneNumber, age } = req.body;
        if (!username || !email || !password) {
            res.status(400).json({
                message: "Missing required fields",
            });
            return;
        }
        const user = await getUserByEmail(email)
            .then((res) => {
            return res;
        })
            .catch((err) => {
            return null;
        });
        if (user) {
            res.status(400).json({
                message: "Email already exists",
            });
            return;
        }
        const userByUsername = await getUserByUsername(username)
            .then((res) => {
            return res;
        })
            .catch((err) => {
            return null;
        });
        if (userByUsername) {
            res.status(400).json({
                message: "Username already exists",
            });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const { createUser: response } = await (0, graphql_1.default)().request(mutations_1.CREATE_USER, {
            input: {
                name: username,
                username: username,
                email: email,
                password: hashedPassword,
                phone_number: phoneNumber,
                age: age || 18,
            },
        });
        const jwtToken = generateToken({
            email: email,
            id: response.id,
        });
        const refreshToken = generateRefreshToken({
            email: email,
            id: response.id,
        });
        await (0, graphql_1.default)().request(mutations_1.UPDATE_REFRESH_TOKEN, {
            input: {
                email: email,
                token: refreshToken,
            },
        });
        res.status(201).json({ ...response, jwtToken, refreshToken });
        return;
    }
    catch (err) {
        next(err);
        return;
    }
};
exports.createUser = createUser;
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                message: "Missing required fields",
            });
            return;
        }
        const { loginUser: response } = await (0, graphql_1.default)().request(queries_1.LOGIN_USER, {
            email: email,
            password: password,
        });
        if (response == null) {
            res.status(400).json({
                message: "Invalid email or password",
            });
            return;
        }
        const jwtToken = generateToken({
            email: email,
            id: response.id,
        });
        const refreshToken = generateRefreshToken({
            email: email,
            id: response.id,
        });
        await (0, graphql_1.default)().request(mutations_1.UPDATE_REFRESH_TOKEN, {
            input: {
                email: email,
                token: refreshToken,
            },
        });
        res.status(200).json({ ...response, jwtToken, refreshToken });
        return;
    }
    catch (err) {
        next(err);
        return;
    }
};
exports.loginUser = loginUser;
const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const decodedToken = jsonwebtoken_1.default.verify(refreshToken, config_1.default.JWT_REFRESH_SECRET);
        const user = await getUserByEmail(decodedToken.email);
        if (!user) {
            res.status(401).json({
                message: "Invalid token",
            });
            return;
        }
        const jwtToken = generateToken({
            email: user.email,
            id: user.id,
        });
        const newRefreshToken = generateRefreshToken({
            email: user.email,
            id: user.id,
        });
        await (0, graphql_1.default)().request(mutations_1.UPDATE_REFRESH_TOKEN, {
            input: {
                email: user.email,
                old_token: refreshToken,
                token: newRefreshToken,
            },
        });
        res.status(200).json({
            id: user.id,
            jwtToken: jwtToken,
            refreshToken: newRefreshToken,
        });
        return;
    }
    catch (err) {
        next(err);
        return;
    }
};
exports.refresh = refresh;
const getMe = async (req, res, next) => {
    try {
        const token = res.locals.token;
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.JWT_SECRET);
        const user = await getUserByEmail(decoded.email);
        if (!user) {
            res.status(401).json({
                status: "fail",
                message: "The user belonging to this token does no longer exist",
            });
            return;
        }
        res.status(200).json(user);
        return;
    }
    catch (err) {
        next(err);
        return;
    }
};
exports.getMe = getMe;
const logoutUser = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const user_id = res.locals.uid;
        if (!refreshToken) {
            res.status(400).json({
                message: "Missing required fields",
            });
            return;
        }
        await (0, graphql_1.default)().request(queries_1.LOGOUT_USER, {
            user_id: user_id,
            refresh_token: refreshToken,
        });
        res.status(200).json({
            message: "Logout success",
        });
        return;
    }
    catch (err) {
        next(err);
        return;
    }
};
exports.logoutUser = logoutUser;
