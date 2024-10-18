import { NextFunction, Request, Response } from "express";
import graphQLClient from "../utils/graphql";
import { serverQueries, serverRoleQueries } from "../graphql/queries";
import { log } from "@/utils/log";

export const checkServerAdminMiddleware = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  const { uid, server_id } = res.locals;

  if (!server_id) {
    res.status(400).json({ status: "fail", message: "Server ID is required." });
    return;
  }

  try {
    const {
      server: { owner },
    } = await graphQLClient().request(serverQueries.GET_SERVER_BY_ID, {
      server_id: server_id,
    });

    log.debug(owner, uid);

    if (owner !== uid) {
      const { getRolesAssignedWithUser: roles } = await graphQLClient().request(
        serverRoleQueries.GET_ROLES_ASSIGNED_WITH_USER,
        {
          user_id: uid,
          server_id: server_id,
        }
      );

      // check if there is any role with admin permission
      const isAdmin = roles.some((role: any) => role.is_admin);

      if (!isAdmin) {
        res.status(403).json({
          status: "fail",
          message: "You are not authorized to make this request",
        });
        return;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
