import { Request, Response, NextFunction } from 'express';
import graphQLClient from '../utils/graphql';
import { GET_MULTIPLE_USER_STATUS, GET_USER_STATUS } from '../graphql/queries';
import {
  UPDATE_USER_STATUS_TEXT,
  UPDATE_USER_STATUS_TYPE,
} from '../graphql/mutations';

export const getCurrentUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { uid } = res.locals;
    const userStatus = await graphQLClient().request(GET_USER_STATUS, {
      user_id: uid,
    });
    res.status(200).json(userStatus.getUserStatus);
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
    const userStatus = await graphQLClient().request(GET_USER_STATUS, {
      user_id: id,
    });
    res.status(200).json(userStatus.getUserStatus);
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
      GET_MULTIPLE_USER_STATUS,
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
    const { updateStatusType: response } = await graphQLClient().request(
      UPDATE_USER_STATUS_TYPE,
      {
        user_id,
        type,
      }
    );
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
    const { status_text } = req.body;
    const { updateStatusText: response } = await graphQLClient().request(
      UPDATE_USER_STATUS_TEXT,
      {
        user_id,
        status_text,
      }
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
