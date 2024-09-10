import { Request, Response, NextFunction } from "express";
import { getUserCategoryPermissionsFunc } from "../utils/getUserCategoryPermissions";

export const checkCategoryPermissionMiddleware = (
  requiredPermissions: string[]
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { uid: user_id, server_id, category_id } = res.locals;

    if (!user_id || !server_id) {
      return res.status(401).json({ message: "Unauthorized" });
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
      return currentUserPermissions[permission] === "ALLOWED";
    });

    if (!hasPermission) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.locals.userCategoryId = category_id;
    res.locals.userCategoryPermissions = currentUserPermissions;
    next();
  };
};
