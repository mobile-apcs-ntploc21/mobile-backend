import { NextFunction, Request, Response } from "express";
import { getUserCategoryPermissionsFunc } from "../utils/getUserCategoryPermissions";

export const checkCategoryPermissionMiddleware = (
  requiredPermissions: string[]
) => {
  return async (_req: Request, res: Response, next: NextFunction) => {
    const { uid: user_id, server_id, category_id } = res.locals;

    if (!user_id || !server_id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    let currentUserPermissions = null;
    if (category_id && res.locals?.userCategoryId === category_id) {
      currentUserPermissions = res.locals.userCategoryPermissions;
    } else {
      currentUserPermissions = await getUserCategoryPermissionsFunc(
        user_id,
        category_id,
        server_id
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

    res.locals.userCategoryId = category_id;
    res.locals.userCategoryPermissions = currentUserPermissions;
    next();
  };
};
