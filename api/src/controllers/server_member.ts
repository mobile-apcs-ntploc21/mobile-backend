import { Request, Response, NextFunction } from 'express';
import graphQLClient from '../utils/graphql';
import { serverMemberQueries, serverQueries } from '../graphql/queries';
import { serverMemberMutations } from '../graphql/mutations';

export const getServerMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { serverId } = req.params;
  try {
    const { getServerMembers: members } = await graphQLClient().request(
      serverMemberQueries.GET_SERVER_MEMBERS,
      {
        server_id: serverId,
      }
    );

    if (members.length === 0) return res.json([]);

    return res.json({
      server_id: serverId,
      members: members.map((member: any) => member.user_id),
    });
  } catch (error) {
    return next(error);
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

    return res.json(response.joinServer);
  } catch (error) {
    return next(error);
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

    return res.json(response);
  } catch (error) {
    return next(error);
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

    return res.json(response);
  } catch (error) {
    return next(error);
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

    return res.json(response);
  } catch (error) {
    return next(error);
  }
};
