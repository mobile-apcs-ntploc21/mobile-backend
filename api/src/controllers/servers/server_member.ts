import { Request, Response, NextFunction } from "express";
import graphQLClient from "../../utils/graphql";
import { serverMemberQueries, serverQueries } from "../../graphql/queries";
import { serverMemberMutations } from "../../graphql/mutations";

import redisClient from "@/utils/redisClient";
import { SERVERS } from "@/constants/redisKey";

export const getServerMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { serverId } = req.params;
  const { limit } = req.query;

  try {
    const cachedKey = SERVERS.SERVER_MEMBERS.key({ server_id: serverId });

    const cachedData = await redisClient.fetch(
      cachedKey,
      () =>
        graphQLClient().request(serverMemberQueries.GET_SERVER_MEMBERS, {
          server_id: serverId,
          limit: Number(limit) || 1000,
        }),
      SERVERS.SERVER_MEMBERS.TTL
    );

    const members = cachedData.getServerMembers;

    if (members.length === 0) {
      res.json([]);
      return;
    }

    res.status(200).json(members);
  } catch (error) {
    next(error);
  }
};

export const joinServer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { url } = req.body;
  const { uid } = res.locals;

  try {
    const response = await graphQLClient().request(
      serverMemberMutations.JOIN_SERVER,
      {
        url,
        user_id: uid,
      }
    );

    res.json(response.joinServer);
  } catch (error) {
    next(error);
  }
};

export const addMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user_ids } = req.body;
  const { serverId } = req.params;

  try {
    const { addServerMembers: response } = await graphQLClient().request(
      serverMemberMutations.ADD_SERVER_MEMBERS,
      {
        input: { server_id: serverId, user_ids },
      }
    );

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const removeMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user_ids } = req.body;
  const { serverId } = req.params;

  try {
    const { removeServerMembers: response } = await graphQLClient().request(
      serverMemberMutations.REMOVE_SERVER_MEMBERS,
      {
        input: { server_id: serverId, user_ids },
      }
    );

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const removeSelf = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { uid } = res.locals;
  const { serverId } = req.params;

  try {
    const { removeServerMembers: response } = await graphQLClient().request(
      serverMemberMutations.REMOVE_SERVER_MEMBERS,
      {
        input: { server_id: serverId, user_ids: [uid] },
      }
    );

    res.json(response);
  } catch (error) {
    next(error);
  }
};
