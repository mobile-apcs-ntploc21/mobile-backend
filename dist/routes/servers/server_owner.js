"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_member_1 = require("../../controllers/servers/server_member");
const express_1 = require("express");
const serverOwnerRouter = (0, express_1.Router)({ mergeParams: true });
serverOwnerRouter.post("/members", server_member_1.addMembers);
serverOwnerRouter.delete("/members", server_member_1.removeMembers);
exports.default = serverOwnerRouter;
