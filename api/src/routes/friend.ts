import { Router } from "express";
import {
  addFriend,
  acceptFriend,
  cancelFriendRequest,
  cancelReceivedFriendRequest,
  removeFriend,
  blockUser,
  unblockUser,
  getAllFriends,
  getReceivedFriendRequests,
  getSentFriendRequests,
  getBlockedUsers,
  getRelationshipTypeApi } from "../controllers/friend";
import { authMiddleware } from "../utils/authMiddleware";


const friendRouter = Router();

/* Friend Management */
// add user with `id` as friend (Send friend request).
friendRouter.post('/friends/:id', authMiddleware, addFriend);
// accept friend request from user with `id`
friendRouter.post('/friends/accept/:id', authMiddleware, acceptFriend);
// cancel friend request to user with `id`
friendRouter.delete('/friends/cancel/sent/:id', authMiddleware, cancelFriendRequest);
// cancel received friend request from user with `id`
friendRouter.delete('/friends/cancel/received/:id', authMiddleware, cancelReceivedFriendRequest);
// remove user with `id` from friends
friendRouter.delete('/friends/:id', authMiddleware, removeFriend);

/* Block/Unblock */
// block user with `id`
friendRouter.post('/block/:id', authMiddleware, blockUser);
// unblock user with `id`
friendRouter.delete('/block/:id', authMiddleware, unblockUser);

/* Listing and Queries */
// get all friends of user with `id`
friendRouter.get("/friends/", authMiddleware, getAllFriends);
// get all received friend requests of the current user
friendRouter.get("/friends/requests/received", authMiddleware, getReceivedFriendRequests);
// get all sent friend requests of the current user
friendRouter.get("/friends/requests/sent", authMiddleware, getSentFriendRequests);
// get all blocked users of the current user
friendRouter.get("/block/", authMiddleware, getBlockedUsers);

// get relationship type between the current user and user with `id`
friendRouter.get("/relationship/:id", authMiddleware, getRelationshipTypeApi);


export default friendRouter;