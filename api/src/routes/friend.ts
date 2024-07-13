import { Router } from "express";
import {
  addFriend,
  acceptFriend,
  cancelFriendRequest,
  cancelReceivedFriendRequest,
  removeFriend,
  blockUser,
  unblockUser,
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
friendRouter.get("/relationship/:id", authMiddleware, getRelationshipTypeApi);


export default friendRouter;