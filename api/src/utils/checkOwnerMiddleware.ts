import { Request, Response, NextFunction } from 'express';
import graphQLClient from '../utils/graphql';
import { serverQueries } from '../graphql/queries';

export const checkOwnerMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { uid } = res.locals;
  const { serverId } = req.params;

  if (!serverId)
    return res
      .status(400)
      .json({ status: 'fail', message: 'Server ID is required.' });

  try {
    const {
      server: { owner },
    } = await graphQLClient().request(serverQueries.GET_SERVER_BY_ID, {
      server_id: serverId,
    });

    console.log(owner, uid);

    if (owner !== uid)
      return res.status(403).json({
        status: 'fail',
        message: 'You are not the owner of this server',
      });

    next();
  } catch (error) {
    next(error);
  }
};
