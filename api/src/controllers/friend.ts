import express from "express";
import graphQLClient from "../utils/graphql";
import {
  GET_ALL_FRIENDS,
  GET_BLOCKED_USERS,
  GET_RECEIVED_FRIEND_REQUESTS,
  GET_RELATIONSHIP_TYPE,
  GET_SENT_FRIEND_REQUESTS,
} from "../graphql/queries";
import {
  CREATE_RELATIONSHIP,
  DELETE_RELATIONSHIP,
  UPDATE_RELATIONSHIP,
} from "../graphql/mutations";
import { log } from "@/utils/log";

const getRelationshipType = async (
  user_first_id: string,
  user_second_id: string
) => {
  if (user_first_id > user_second_id) {
    const temp = user_first_id;
    user_first_id = user_second_id;
    user_second_id = temp;
  }
  const { getRelationshipType: response } = await graphQLClient().request(
    GET_RELATIONSHIP_TYPE,
    {
      user_first_id: user_first_id,
      user_second_id: user_second_id,
    }
  );

  return response;
};

const deleteRelationship = async (
  user_first_id: string,
  user_second_id: string
) => {
  if (user_first_id > user_second_id) {
    const temp = user_first_id;
    user_first_id = user_second_id;
    user_second_id = temp;
  }
  return await graphQLClient().request(DELETE_RELATIONSHIP, {
    user_first_id: user_first_id,
    user_second_id: user_second_id,
  });
};

/* Friend Management */

// Add user with `id` as friend (Send friend request).
export const addFriend = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
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

    const relationshipType = await getRelationshipType(
      user_first_id,
      user_second_id
    )
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
      const response = await graphQLClient().request(CREATE_RELATIONSHIP, {
        user_first_id: current_user,
        user_second_id: friend,
        type: "PENDING_FIRST_SECOND",
      });
    } else {
      const response = await graphQLClient().request(CREATE_RELATIONSHIP, {
        user_first_id: friend,
        user_second_id: current_user,
        type: "PENDING_SECOND_FIRST",
      });
    }

    res.status(200).json({
      message: "Friend request sent.",
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
    return;
  }
};

// Accept friend request from user with `id`.
export const acceptFriend = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
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

    if (
      user_first_id == current_user &&
      relationshipType == "PENDING_SECOND_FIRST"
    ) {
      const response = await graphQLClient().request(UPDATE_RELATIONSHIP, {
        user_first_id: current_user,
        user_second_id: friend,
        type: "FRIEND",
      });
    } else if (
      user_first_id == friend &&
      relationshipType == "PENDING_FIRST_SECOND"
    ) {
      const response = await graphQLClient().request(UPDATE_RELATIONSHIP, {
        user_first_id: friend,
        user_second_id: current_user,
        type: "FRIEND",
      });
    } else {
      res.status(400).json({
        message: "You cannot accept this user as a friend.",
      });
      return;
    }

    res.status(200).json({
      message: "Friend request accepted.",
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
    return;
  }
};

// Cancel sent friend request to user with `id`.
export const cancelFriendRequest = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
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

    if (
      (current_user < friend && relationshipType == "PENDING_FIRST_SECOND") ||
      (current_user > friend && relationshipType == "PENDING_SECOND_FIRST")
    ) {
      const response = await deleteRelationship(current_user, friend);
    } else {
      res.status(400).json({
        message: "You cannot cancel friend request to this user.",
      });
      return;
    }

    res.status(200).json({
      message: "Friend request cancelled.",
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
    return;
  }
};

// Cancel received friend request from user with `id`.
export const cancelReceivedFriendRequest = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
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

    if (
      (current_user > friend && relationshipType == "PENDING_FIRST_SECOND") ||
      (current_user < friend && relationshipType == "PENDING_SECOND_FIRST")
    ) {
      const response = await deleteRelationship(current_user, friend);
    } else {
      res.status(400).json({
        message: "You cannot cancel received friend request from this user.",
      });
      return;
    }

    res.status(200).json({
      message: "Received friend request cancelled.",
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
    return;
  }
};

// remove friend with `id`
export const removeFriend = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
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
    } else {
      res.status(400).json({
        message: "You cannot remove this user as a friend.",
      });
      return;
    }

    res.status(200).json({
      message: "Friend removed.",
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
    return;
  }
};

/* Block/Unblock users */
// Block user with `id`
export const blockUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
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

    const relationshipType = await getRelationshipType(
      user_first_id,
      user_second_id
    )
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return null;
      });

    if (
      (user_first_id == current_user &&
        relationshipType == "BLOCK_FIRST_SECOND") ||
      (user_first_id == friend && relationshipType == "BLOCK_SECOND_FIRST")
    ) {
      res.status(400).json({
        message: "You have already blocked this user.",
      });
      return;
    }

    if (
      (user_first_id == friend && relationshipType == "BLOCK_FIRST_SECOND") ||
      (user_first_id == current_user &&
        relationshipType == "BLOCK_SECOND_FIRST")
    ) {
      res.status(400).json({
        message: "You have already been blocked by this user.",
      });
      return;
    }

    if (!relationshipType) {
      if (user_first_id == current_user) {
        const response = await graphQLClient().request(CREATE_RELATIONSHIP, {
          user_first_id: current_user,
          user_second_id: friend,
          type: "BLOCK_FIRST_SECOND",
        });
      } else {
        const response = await graphQLClient().request(CREATE_RELATIONSHIP, {
          user_first_id: friend,
          user_second_id: current_user,
          type: "BLOCK_SECOND_FIRST",
        });
      }
    } else {
      if (user_first_id == current_user) {
        const response = await graphQLClient().request(UPDATE_RELATIONSHIP, {
          user_first_id: current_user,
          user_second_id: friend,
          type: "BLOCK_FIRST_SECOND",
        });
      } else {
        const response = await graphQLClient().request(UPDATE_RELATIONSHIP, {
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
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
    return;
  }
};

// Unblock user with `id`
export const unblockUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
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

    const relationshipType = await getRelationshipType(
      user_first_id,
      user_second_id
    )
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

    if (
      (user_first_id == current_user &&
        relationshipType != "BLOCK_FIRST_SECOND") ||
      (user_first_id == friend && relationshipType != "BLOCK_SECOND_FIRST")
    ) {
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
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
    return;
  }
};

/* Listing and Queries */

// List all friends
export const getAllFriends = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const user_id = res.locals.uid;

    const { getAllFriends: response } = await graphQLClient().request(
      GET_ALL_FRIENDS,
      {
        user_id: user_id,
      }
    );

    res.status(200).json({
      friends: response,
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
    return;
  }
};

// List received friend requests
export const getReceivedFriendRequests = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const user_id = res.locals.uid;

    const { getReceivedFriendRequests: response } =
      await graphQLClient().request(GET_RECEIVED_FRIEND_REQUESTS, {
        user_id: user_id,
      });

    res.status(200).json({
      requests: response,
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
    return;
  }
};

// List sent friend requests
export const getSentFriendRequests = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const user_id = res.locals.uid;

    log.debug(user_id);

    const { getSentFriendRequests: response } = await graphQLClient().request(
      GET_SENT_FRIEND_REQUESTS,
      {
        user_id: user_id,
      }
    );

    res.status(200).json({
      requests: response,
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
    return;
  }
};

// List blocked users
export const getBlockedUsers = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const user_id = res.locals.uid;

    const { getBlockedUsers: response } = await graphQLClient().request(
      GET_BLOCKED_USERS,
      {
        user_id: user_id,
      }
    );

    res.status(200).json({
      blocked: response,
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
    return;
  }
};

// Get user relationship with `id`
// Returns: "NOT-FRIEND" | "REQUEST-SENT" | "REQUEST-RECEIVED" | "FRIEND" | "BLOCK"
export const getRelationshipTypeApi = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const current_user = res.locals.uid;
    const friend = req.params.id;

    let user_first_id = current_user;
    let user_second_id = friend;

    if (current_user > friend) {
      user_first_id = friend;
      user_second_id = current_user;
    }

    const relationshipType = await getRelationshipType(
      user_first_id,
      user_second_id
    )
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
      } else if (relationshipType == "PENDING_SECOND_FIRST") {
        res.status(200).json({ type: "REQUEST-RECEIVED" });
        return;
      } else if (relationshipType == "FRIEND") {
        res.status(200).json({ type: "FRIEND" });
        return;
      } else if (
        relationshipType == "BLOCK_FIRST_SECOND" ||
        relationshipType == "BLOCK_SECOND_FIRST"
      ) {
        res.status(200).json({ type: "BLOCK" });
        return;
      }
    } else {
      if (relationshipType == "PENDING_FIRST_SECOND") {
        res.status(200).json({ type: "REQUEST-RECEIVED" });
        return;
      } else if (relationshipType == "PENDING_SECOND_FIRST") {
        res.status(200).json({ type: "REQUEST-SENT" });
        return;
      } else if (relationshipType == "FRIEND") {
        res.status(200).json({ type: "FRIEND" });
        return;
      } else if (
        relationshipType == "BLOCK_SECOND_FIRST" ||
        relationshipType == "BLOCK_FIRST_SECOND"
      ) {
        res.status(200).json({ type: "BLOCK" });
        return;
      }
    }

    res.status(200).json({ type: "UNDEFINED" });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
    return;
  }
};
