import { Request, Response, NextFunction } from 'express';
import graphQLClient from '../utils/graphql';
import {serverQueries, serverRoleQueries} from '../graphql/queries';
import {getUserCategoryPermissionsFunc} from "../utils/getUserCategoryPermissions";

export const checkServerPermissionMiddleware = (requiredPermissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { user_id, server_id, category_id } = res.locals;

    if (!user_id || !server_id || !category_id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const currentUserPermissions = await getUserCategoryPermissionsFunc(user_id, category_id, server_id);

    const hasPermission = requiredPermissions.every((permission) => {
      return currentUserPermissions[permission];
    });

    if (!hasPermission) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
