import { NextFunction, Request, Response } from "express";
import graphQLClient from "../utils/graphql";
import { serverMemberQueries } from "../graphql/queries";

import redisClient from "@/utils/redisClient";
import { SERVERS } from "@/constants/redisKey";

/**
 * @swagger
 * components:
 *  responses:
 *    CheckMembershipMiddlewareError:
 *      description: Error response when the user is not a member of the server.
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: string
 *                example: fail
 *              message:
 *                type: string
 *                example: You are not a member of this server
 */

export const checkMembershipMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { uid: user_id } = res.locals;
  const { serverId } = req.params;

  if (!serverId) {
    res.status(400).json({ status: "fail", message: "Server ID is required." });
    return;
  }

  // Skip this step if we already have the server_id in res.locals
  if (res.locals?.server_id === serverId) {
    return next();
  }

  try {
    const cacheKey = SERVERS.SERVER_LIST.key({ user_id });
    const cachedServerList = await redisClient.read(cacheKey);

    if (cachedServerList) {
      const serverList = JSON.parse(cachedServerList);
      const server = serverList.find((s: any) => s.id === serverId);

      if (!server) {
        res.status(403).json({
          status: "fail",
          message: "You are not a member of this server",
        });
        return;
      }

      res.locals.server_id = serverId;
      next();
      return;
    }

    const flag = await graphQLClient().request(
      serverMemberQueries.CHECK_SERVER_MEMBER,
      {
        server_id: serverId,
        user_id,
      }
    );
    if (flag === null || !flag.checkServerMember) {
      res.status(403).json({
        status: "fail",
        message: "You are not a member of this server",
      });
      return;
    }

    res.locals.server_id = serverId;
    next();
  } catch (error) {
    next(error);
  }
};
