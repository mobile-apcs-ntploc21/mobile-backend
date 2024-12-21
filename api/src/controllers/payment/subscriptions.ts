import express from "express";
import graphQLClient from "../../utils/graphql";

import { userSubscriptionQueries } from "@/graphql/queries";

export const _getUserSubscription = async (user_id: string) => {
  const response = await graphQLClient().request(
    userSubscriptionQueries.GET_USER_SUBSCRIPTION,
    {
      user_id: user_id,
    }
  );

  return response.userSubscription;
};

// ========================================

export const getUserSubscription = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    let { id: user_id } = req.params;

    if (!user_id || user_id === undefined) {
      user_id = res.locals?.uid;
    }

    const userSubscription = await _getUserSubscription(user_id)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return null;
      });

    if (!userSubscription) {
      res.status(400).json({
        message: "User subscription not found",
      });
      return;
    }

    res.status(200).json(userSubscription);
  } catch (error) {
    next(error);
  }
};
