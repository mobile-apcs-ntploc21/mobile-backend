import express from "express";
import graphQLClient from "../utils/graphql";
import { GET_RELATIONSHIP_TYPE } from "../graphql/queries";
import { CREATE_RELATIONSHIP, UPDATE_RELATIONSHIP, DELETE_RELATIONSHIP } from "../graphql/mutations";

const getRelationshipType = async (user_first_id: string, user_second_id: string) => {
  if (user_first_id > user_second_id) {
    const temp = user_first_id;
    user_first_id = user_second_id;
    user_second_id = temp;
  }
  const { getRelationshipType: response } = await graphQLClient().request(GET_RELATIONSHIP_TYPE, {
    user_first_id: user_first_id,
    user_second_id: user_second_id,
  });

  return response;
}

/* Friend Management */

// Add user with `id` as friend (Send friend request).
export const addFriend = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const current_user = req.params.uid;
    const friend = req.params.id;

    if (current_user == friend) {
      return res.status(400).json({
        message: "You cannot add yourself as a friend.",
      });
    }

    let user_first_id = current_user;
    let user_second_id = friend;

    if (current_user > friend) {
      user_first_id = friend;
      user_second_id = current_user;
    }

    const relationshipType = await getRelationshipType(user_first_id, user_second_id)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return null;
      });

    if (relationshipType) {
      return res.status(400).json({
        message: "You cannot add this user as a friend.",
      });
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

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Accept friend request from user with `id`.
export const acceptFriend = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const current_user = req.params.uid;
    const friend = req.params.id;

    if (current_user == friend) {
      return res.status(400).json({
        message: "You cannot accept yourself as a friend.",
      });
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
      return res.status(400).json({
        message: "You cannot accept this user as a friend.",
      });
    }

    if (user_first_id == current_user && relationshipType == "PENDING_SECOND_FIRST") {
      const response = await graphQLClient().request(UPDATE_RELATIONSHIP, {
        user_first_id: current_user,
        user_second_id: friend,
        type: "FRIEND",
      });
    } else if (user_first_id == friend && relationshipType == "PENDING_FIRST_SECOND") {
      const response = await graphQLClient().request(UPDATE_RELATIONSHIP, {
        user_first_id: friend,
        user_second_id: current_user,
        type: "FRIEND",
      });
    } else {
      return res.status(400).json({
        message: "You cannot accept this user as a friend.",
      });
    }

    return res.status(200).json({
      message: "Friend request accepted.",
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Cancel sent friend request to user with `id`.
export const cancelFriendRequest = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const current_user = req.params.uid;
    const friend = req.params.id;

    if (current_user == friend) {
      return res.status(400).json({
        message: "You cannot cancel friend request to yourself.",
      });
    }

    const relationshipType = await getRelationshipType(current_user, friend)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return null;
      });

    if (!relationshipType) {
      return res.status(400).json({
        message: "You cannot cancel friend request to this user.",
      });
    }

    if (current_user < friend && relationshipType == "PENDING_FIRST_SECOND") {
      const response = await graphQLClient().request(DELETE_RELATIONSHIP, {
        user_first_id: current_user,
        user_second_id: friend,
      });
    } else if (current_user > friend && relationshipType == "PENDING_SECOND_FIRST") {
      const response = await graphQLClient().request(DELETE_RELATIONSHIP, {
        user_first_id: friend,
        user_second_id: current_user,
      });
    } else {
      return res.status(400).json({
        message: "You cannot cancel friend request to this user.",
      });
    }

    return res.status(200).json({
      message: "Friend request cancelled.",
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Cancel received friend request from user with `id`.
export const cancelReceivedFriendRequest = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const current_user = req.params.uid;
    const friend = req.params.id;

    if (current_user == friend) {
      return res.status(400).json({
        message: "You cannot cancel received friend request from yourself.",
      });
    }

    const relationshipType = await getRelationshipType(current_user, friend)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return null;
      });

    if (!relationshipType) {
      return res.status(400).json({
        message: "You cannot cancel received friend request from this user.",
      });
    }

    if (current_user > friend && relationshipType == "PENDING_FIRST_SECOND") {
      const response = await graphQLClient().request(DELETE_RELATIONSHIP, {
        user_first_id: friend,
        user_second_id: current_user,
      });
    } else if (current_user < friend && relationshipType == "PENDING_SECOND_FIRST") {
      const response = await graphQLClient().request(DELETE_RELATIONSHIP, {
        user_first_id: current_user,
        user_second_id: friend,
      });
    } else {
      return res.status(400).json({
        message: "You cannot cancel received friend request from this user.",
      });
    }

    return res.status(200).json({
      message: "Received friend request cancelled.",
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// remove friend with `id`
export const removeFriend = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const current_user = req.params.uid;
    const friend = req.params.id;

    if (current_user == friend) {
      return res.status(400).json({
        message: "You cannot remove yourself as a friend.",
      });
    }

    const relationshipType = await getRelationshipType(current_user, friend)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return null;
      });

    if (!relationshipType) {
      return res.status(400).json({
        message: "You cannot remove this user as a friend.",
      });
    }

    if (relationshipType == "FRIEND") {
      const response = await graphQLClient().request(DELETE_RELATIONSHIP, {
        user_first_id: current_user,
        user_second_id: friend,
      });
    } else {
      return res.status(400).json({
        message: "You cannot remove this user as a friend.",
      });
    }

    return res.status(200).json({
      message: "Friend removed.",
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

/* Listing and Queries */

export const getRelationshipTypeApi = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const current_user = req.params.uid;
    const friend = req.params.id;

    let user_first_id = current_user;
    let user_second_id = friend;

    if (current_user > friend) {
      user_first_id = friend;
      user_second_id = current_user;
    }

    const { getRelationshipType: response } = await graphQLClient().request(GET_RELATIONSHIP_TYPE, {
      user_first_id: current_user,
      user_second_id: friend,
    });

    if (!response) {
        return res.status(200).json({"type": "NOT-FRIEND"});
    }

    return res.status(200).json({"type": response});

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

