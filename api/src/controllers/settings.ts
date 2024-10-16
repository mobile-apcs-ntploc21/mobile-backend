import express from "express";
import graphQLClient from "../utils/graphql";
import { settingsMutations } from "../graphql/mutations";
import { settingsQueries } from "../graphql/queries";

const getUserSettings = async (user_id: string) => {
  const response = await graphQLClient().request(
    settingsQueries.GET_USER_SETTINGS,
    {
      user_id: user_id,
    }
  );

  return response.getUserSettings;
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
      return res
        .status(400)
        .json({ message: "Settings is not in JSON format !" });
    }

    return res.status(200).json({ ...parsedSettings });
  } catch (error) {
    return next(error);
  }
};

export const createSettings = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const currentUser = res.locals.uid as string;
  const { settings } = req.body as { settings: string };
  let parsedSettings = null;

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

    return res.status(200).json({
      message: "Settings created successfully !",
      settings: parsedSettings,
    });
  } catch (error) {
    return next(error);
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

    return res.status(200).json({
      message: "Settings updated successfully !",
      settings: req.body,
    });
  } catch (error) {
    return next(error);
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

    return res.status(200).json({ message: "Settings deleted successfully !" });
  } catch (error) {
    return next(error);
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

    return res.status(200).json({
      message: "Settings restored successfully !",
      settings: parsedSettings,
    });
  } catch (error) {
    return next(error);
  }
};
