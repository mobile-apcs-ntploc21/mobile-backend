import { NextFunction, Request, Response } from "express";
import graphQLClient from "../utils/graphql";
import { serverQueries } from "../graphql/queries";
import { log } from "@/utils/log";

/**
 * @swagger
 * components:
 *  responses:
 *    CheckOwnerMiddlewareError:
 *      description: Error response when the user is not the owner of the server.
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
 *                example: You are not the owner of this server
 */

export const checkOwnerMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { uid } = res.locals;
  const { serverId } = req.params;

  if (!serverId) {
    res.status(400).json({ status: "fail", message: "Server ID is required." });
    return;
  }

  try {
    const {
      server: { owner },
    } = await graphQLClient().request(serverQueries.GET_SERVER_BY_ID, {
      server_id: serverId,
    });

    log.debug(owner, uid);

    if (owner !== uid) {
      res.status(403).json({
        status: "fail",
        message: "You are not the owner of this server",
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
