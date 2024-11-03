"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const xss_clean_1 = __importDefault(require("xss-clean"));
const error_1 = __importDefault(require("./controllers/error"));
const friend_1 = __importDefault(require("./routes/friend"));
const server_1 = __importDefault(require("./routes/servers/server"));
const serverEmojis_1 = __importDefault(require("./routes/servers/serverEmojis"));
const server_bans_1 = __importDefault(require("./routes/servers/server_bans"));
const settings_1 = __importDefault(require("./routes/settings"));
const user_1 = __importDefault(require("./routes/user"));
const user_profile_1 = __importDefault(require("./routes/user_profile"));
const user_status_1 = __importDefault(require("./routes/user_status"));
const authMiddleware_1 = require("./utils/authMiddleware");
const checkMembershipMiddleware_1 = require("./utils/checkMembershipMiddleware");
const config_1 = __importDefault(require("@/config"));
const log_1 = require("@/utils/log");
const swagger_1 = __importDefault(require("./swagger"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, express_mongo_sanitize_1.default)());
app.use((0, xss_clean_1.default)());
app.use(body_parser_1.default.json({ limit: "50mb" }));
app.use(body_parser_1.default.urlencoded({ limit: "50mb", extended: true }));
const limiter = (0, express_rate_limit_1.default)({
    max: Number(process.env.MAX_RATE_LIMIT),
    windowMs: Number(process.env.MAX_RATE_LIMIT_TIME) * 60 * 1000,
    message: `Too many requests from this IP, please try again after ${process.env.MAX_RATE_LIMIT_TIME} minutes !`,
});
if (process.env.NODE_ENV !== "development")
    app.use("/api", limiter);
if (process.env.NODE_ENV === "development")
    app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(swagger_1.default);
app.use("/api/v1/users", user_1.default);
app.use("/api/v1/settings", authMiddleware_1.authMiddleware, settings_1.default);
app.use("/api/v1/", authMiddleware_1.authMiddleware, user_status_1.default);
app.use("/api/v1/", authMiddleware_1.authMiddleware, friend_1.default);
app.use("/api/v1/profile/", authMiddleware_1.authMiddleware, user_profile_1.default);
app.use("/api/v1/servers", server_1.default);
app.use("/api/v1/servers", serverEmojis_1.default);
app.use("/api/v1/servers/:serverId/emojis", authMiddleware_1.authMiddleware, checkMembershipMiddleware_1.checkMembershipMiddleware, serverEmojis_1.default);
app.use("/api/v1/servers", authMiddleware_1.authMiddleware, server_bans_1.default);
app.all("*", (req, res, _next) => {
    res.status(404).json({
        status: "fail",
        message: `Cannot find ${req.originalUrl} on this server !`,
    });
});
app.use((err, _req, res, _next) => {
    log_1.log.error(err);
    res.set("Content-Type", "application/json");
    res.statusCode = 400;
    res.json({
        error: {
            message: err.message,
        },
    });
});
app.use(error_1.default);
app.listen(config_1.default.PORT, () => log_1.log.info(`API is listening on port ${config_1.default.PORT}...`));
exports.default = app;
