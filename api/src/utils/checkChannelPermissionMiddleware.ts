import { Request, Response, NextFunction } from "express";
import { getUserChannelPermissionsFunc } from "../utils/getUserChannelPermissions";

export const checkChannelPermissionMiddleware = (
  requiredPermissions: string[]
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { uid: user_id, server_id, channel_id } = res.locals;

    if (!user_id || !server_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let currentUserPermissions = null;
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
      return currentUserPermissions[permission] === "ALLOWED";
    });

    if (!hasPermission) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.locals.userChannelId = channel_id;
    res.locals.userChannelPermissions = currentUserPermissions;
    next();
  };
};
