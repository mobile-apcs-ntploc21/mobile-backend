import { Router } from "express";
import {
  acceptFriend,
  addFriend,
  blockUser,
  cancelFriendRequest,
  cancelReceivedFriendRequest,
  getAllFriends,
  getBlockedUsers,
  getReceivedFriendRequests,
  getRelationshipTypeApi,
  getSentFriendRequests,
  removeFriend,
  unblockUser,
} from "@/controllers/friend";

const friendRouter = Router();

/* Friend Management */
// add user with `id` as friend (Send friend request).
friendRouter.post("/friends/:id", addFriend);
// accept friend request from user with `id`
friendRouter.post("/friends/accept/:id", acceptFriend);
// cancel friend request to user with `id`
friendRouter.delete("/friends/cancel/sent/:id", cancelFriendRequest);
// cancel received friend request from user with `id`
friendRouter.delete(
  "/friends/cancel/received/:id",
  cancelReceivedFriendRequest
);
// remove user with `id` from friends
friendRouter.delete("/friends/:id", removeFriend);

/* Block/Unblock */
// block user with `id`
friendRouter.post("/block/:id", blockUser);
// unblock user with `id`
friendRouter.delete("/block/:id", unblockUser);

/* Listing and Queries */
// get all friends of user with `id`
friendRouter.get("/friends/", getAllFriends);
// get all received friend requests of the current user
friendRouter.get("/friends/requests/received", getReceivedFriendRequests);
// get all sent friend requests of the current user
friendRouter.get("/friends/requests/sent", getSentFriendRequests);
// get all blocked users of the current user
friendRouter.get("/block/", getBlockedUsers);

// get relationship type between the current user and user with `id`
friendRouter.get("/relationship/:id", getRelationshipTypeApi);

export default friendRouter;
