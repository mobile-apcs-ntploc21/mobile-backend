import { Request, Response, NextFunction } from "express";
import graphQLClient from "../utils/graphql";
import { serverQueries, serverRoleQueries } from "../graphql/queries";
import { createQuery } from "./getUserChannelPermissions";

// ======================

export const checkServerPermissionMiddleware = (
  requiredPermissions: string[]
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { uid, server_id } = res.locals;

    if (!server_id)
      return res
        .status(400)
        .json({ status: "fail", message: "Server ID is required." });

    const checkPermissionsQuery = createQuery(null, null);
    const response = await graphQLClient().request(checkPermissionsQuery, {
      server_id: server_id,
      category_id: null,
      channel_id: null,
      user_id: uid,
    });

    try {
      const {
        server: { owner },
      } = response;

      if (owner === uid) {
        next();
        return;
      }

      const { getRolesAssignedWithUser: roles } = response;

      // check if there is any role with admin permission
      const isAdmin = roles.some((role: any) => role.is_admin);

      if (isAdmin) {
        next();
        return;
      }

      // check if user has required permission, the way we check is first, we will merge all the permissions into one final permission array
      // the way we merge, considering arbitrary permission, it will be set to "ALLOWED" if any of the role has it "ALLOWED"
      // then we will check if all the required permissions are in the final permission array (has "ALLOWED" status)
      // if any of the required permission is not in the final permission array, we will return 403
      const finalPermissions = roles.reduce((acc: any, role: any) => {
        // Ensure role.permissions is a valid JSON string before parsing
        let role_permissions;
        try {
          role_permissions = JSON.parse(role.permissions);
        } catch (e) {
          console.error("Invalid JSON in role.permissions:", role.permissions);
          return acc;
        }

        // Ensure role_permissions is an object
        if (typeof role_permissions !== "object" || role_permissions === null) {
          console.error("role.permissions is not an object:", role_permissions);
          return acc;
        }

        for (const permission in role_permissions) {
          if (role_permissions.hasOwnProperty(permission)) {
            // All the permission that is 'ALLOWED', we will keep it in the final permission set
            if (role_permissions[permission] !== "DENIED") {
              acc[permission] = role_permissions[permission];
            }
          }
        }

        return acc;
      }, {}); // Initialize the outer accumulator as an empty object

      const hasAllPermissions = requiredPermissions.every(
        (permission) => finalPermissions[permission] === "ALLOWED"
      );

      if (!hasAllPermissions) {
        return res.status(403).json({
          status: "fail",
          message: "You are not authorized to make this request",
        });
      }

      res.locals.userServerPermissions = finalPermissions;

      next();
    } catch (error) {
      next(error);
    }
  };
};
