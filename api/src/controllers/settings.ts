import express from "express";
import graphQLClient from "../utils/graphql";
import { settingsMutations } from "../graphql/mutations";
import { settingsQueries } from "../graphql/queries";

import RedisCache from "../utils/redisClient";
import { USERS } from "../constants/redisKey";

const getUserSettings = async (user_id: string) => {
  const cacheKey = USERS.USER_SETTINGS.key({ user_id: user_id });

  const cachedData = await RedisCache.fetch(
    cacheKey,
    async () => {
      const response = await graphQLClient().request(
        settingsQueries.GET_USER_SETTINGS,
        {
          user_id: user_id,
        }
      );

      return response.getUserSettings;
    },
    USERS.USER_SETTINGS.TTL
  );

  return cachedData;
};

/* ======================================== */

export const getSettings = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const currentUser = res.locals.uid;

  try {
    const settings = await getUserSettings(currentUser).catch(() => null);

    let parsedSettings = null;
    try {
      parsedSettings = JSON.parse(settings.settings);
    } catch (error) {
      res.status(400).json({ message: "Settings is not in JSON format !" });
      return;
    }

    res.status(200).json({ ...parsedSettings });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const createSettings = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const currentUser = res.locals.uid as string;
  const { settings } = req.body as { settings: string };
  const parsedSettings = null;

  try {
    const response = await graphQLClient().request(
      settingsMutations.CREATE_USER_SETTINGS,
      {
        input: {
          user_id: currentUser,
          settings: JSON.stringify(req.body),
        },
      }
    );

    res.status(200).json({
      message: "Settings created successfully !",
      settings: parsedSettings,
    });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const updateSettings = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const currentUser = res.locals.uid as string;

  try {
    const response = await graphQLClient().request(
      settingsMutations.UPDATE_USER_SETTINGS,
      {
        input: {
          user_id: currentUser,
          settings: JSON.stringify(req.body),
        },
      }
    );

    res.status(200).json({
      message: "Settings updated successfully !",
      settings: req.body,
    });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const deleteSettings = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const currentUser = res.locals.uid;

  try {
    const response = await graphQLClient().request(
      settingsMutations.DELETE_USER_SETTINGS,
      {
        user_id: currentUser,
      }
    );

    res.status(200).json({ message: "Settings deleted successfully !" });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const resetSettings = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const currentUser = res.locals.uid;

  try {
    const response = await graphQLClient().request(
      settingsMutations.RESTORE_USER_SETTINGS,
      {
        user_id: currentUser,
      }
    );

    const parsedSettings = JSON.parse(response.restoreUserSettings.settings);

    res.status(200).json({
      message: "Settings restored successfully !",
      settings: parsedSettings,
    });
    return;
  } catch (error) {
    next(error);
    return;
  }
};
