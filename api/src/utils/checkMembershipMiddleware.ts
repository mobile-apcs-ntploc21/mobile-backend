import { NextFunction, Request, Response } from "express";
import graphQLClient from "../utils/graphql";
import { serverMemberQueries } from "../graphql/queries";

/**
 * @swagger
 * components:
 *  schemas:
 *    CommonError:
 *      type: object
 *      properties:
 *        status:
 *          type: string
 *        message:
 *          type: string
 *
 *  responses:
 *    CheckMembership:
 *      description: You are not a member of this server
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/CommonError'
 *          example:
 *            status: fail
 *            message: You are not a member of this server
 *
 *    ServerIdRequired:
 *      description: Server ID is required
 *      content:
 *         application/json:
 *          schema:
 *            $ref: '#/components/schemas/CommonError'
 *          example:
 *            status: fail
 *            message: Server ID is required
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
