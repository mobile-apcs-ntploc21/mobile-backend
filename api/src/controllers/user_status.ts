import { Request, Response, NextFunction } from "express";
import graphQLClient from "../utils/graphql";
import { userStatusQueries } from "../graphql/queries";
import { userStatusMutations } from "../graphql/mutations";

import RedisClient from "@/utils/redisClient";
import { USERS } from "../constants/redisKey";

export const getCurrentUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { uid } = res.locals;

    const redisKey = USERS.USER_STATUS.key({ user_id: uid });
    const cachedData = await RedisClient.fetch(
      redisKey,
      async () => {
        return await graphQLClient().request(
          userStatusQueries.GET_USER_STATUS,
          {
            user_id: uid,
          }
        );
      },
      USERS.USER_STATUS.TTL
    );

    res.status(200).json(cachedData.getUserStatus);
  } catch (error) {
    next(error);
  }
};

export const getUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const redisKey = USERS.USER_STATUS.key({ user_id: id });
    const cachedData = await RedisClient.fetch(
      redisKey,
      async () => {
        return await graphQLClient().request(
          userStatusQueries.GET_USER_STATUS,
          {
            user_id: id,
          }
        );
      },
      USERS.USER_STATUS.TTL
    );

    res.status(200).json(cachedData.getUserStatus);
  } catch (error) {
    next(error);
  }
};

export const getMultipleUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user_ids } = req.body;
    const userStatuses = await graphQLClient().request(
      userStatusQueries.GET_MULTIPLE_USER_STATUS,
      {
        user_ids,
      }
    );
    res.status(200).json(userStatuses.getMultipleUserStatus);
  } catch (error) {
    next(error);
  }
};

export const updateStatusType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { uid: user_id } = res.locals;
    const { type } = req.body;

    const cacheKey = USERS.USER_STATUS.key({ user_id });

    // Update the database first
    const { updateStatusType: response } = await graphQLClient().request(
      userStatusMutations.UPDATE_USER_STATUS_TYPE,
      {
        user_id,
        type,
      }
    );

    // Update the cache
    if (response) {
      await RedisClient.write(cacheKey, response, USERS.USER_STATUS.TTL);
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateStatusText = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { uid: user_id } = res.locals;
    const { status_text, expire_date } = req.body;

    const cacheKey = USERS.USER_STATUS.key({ user_id });

    // Update the database first
    const { updateStatusText: response } = await graphQLClient().request(
      userStatusMutations.UPDATE_USER_STATUS_TEXT,
      {
        user_id,
        status_text,
        expire_date,
      }
    );

    // Update the cache
    if (response) {
      await RedisClient.write(cacheKey, response, USERS.USER_STATUS.TTL);
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
