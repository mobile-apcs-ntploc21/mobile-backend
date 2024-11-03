"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const friend_1 = require("@/controllers/friend");
const friendRouter = (0, express_1.Router)();
friendRouter.post("/friends/:id", friend_1.addFriend);
friendRouter.post("/friends/accept/:id", friend_1.acceptFriend);
friendRouter.delete("/friends/cancel/sent/:id", friend_1.cancelFriendRequest);
friendRouter.delete("/friends/cancel/received/:id", friend_1.cancelReceivedFriendRequest);
friendRouter.delete("/friends/:id", friend_1.removeFriend);
friendRouter.post("/block/:id", friend_1.blockUser);
friendRouter.delete("/block/:id", friend_1.unblockUser);
friendRouter.get("/friends/", friend_1.getAllFriends);
friendRouter.get("/friends/requests/received", friend_1.getReceivedFriendRequests);
friendRouter.get("/friends/requests/sent", friend_1.getSentFriendRequests);
friendRouter.get("/block/", friend_1.getBlockedUsers);
friendRouter.get("/relationship/:id", friend_1.getRelationshipTypeApi);
exports.default = friendRouter;
