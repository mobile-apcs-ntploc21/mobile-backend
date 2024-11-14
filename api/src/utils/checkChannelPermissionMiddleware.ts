import { NextFunction, Request, Response } from "express";
import { getUserChannelPermissionsFunc } from "../utils/getUserChannelPermissions";

/**
 * @swagger
 * components:
 *  responses:
 *    CheckChannelPermissionMiddlewareError:
 *      description: Error response when the user does not have the required permissions.
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
 *                example: Forbidden
 */

export const checkChannelPermissionMiddleware = (
  requiredPermissions: string[]
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { uid: user_id, server_id, channel_id } = res.locals;

    if (!user_id || !server_id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    let currentUserPermissions: any = null;
    if (channel_id && res.locals?.userChannelId === channel_id) {
      currentUserPermissions = res.locals.userChannelPermissions;
    } else {
      currentUserPermissions = await getUserChannelPermissionsFunc(
        user_id,
        channel_id,
        server_id,
        { channelObject: res.locals.channelObject }
      );
    }

    const hasPermission = requiredPermissions.every((permission) => {
      // @ts-ignore
      return currentUserPermissions[permission] === "ALLOWED";
    });

    if (!hasPermission) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    res.locals.userChannelId = channel_id;
    res.locals.userChannelPermissions = currentUserPermissions;
    next();
  };
};
