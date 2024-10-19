import graphQLClient from "./graphql";
import { CategoryPermissions } from "../constants/permissions";
import { createQuery } from "./getUserChannelPermissions";

// ======================
// This is for graphQL query

// ======================
/*
- get all server roles assigned with the current user
- for each server role, get the category permissions associated with that role (if exists)
    + If exists, then calculate the final category permissions associated with that role
        * The way we combine is, if the category permission is "DEFAULT", then it will inherit the permission value from server role permissions
        * Otherwise, keep it (in other word, if the value associated with the corresponding category permission is "ALLOWED" or "DENIED", keep it)
    + Otherwise, the final category permission associated with that role is the server role permissions
- Calculate the combined category permissions associated with those roles
    * That is, for each permission, if there exists a role with permission value "ALLOWED", the corresponding permission value will be "ALLOWED", otherwise, "DENIED"
- get category permissions assigned with the current user (if exists)
    + If exists, we will calculate the final category permissions for that user
        * If the corresponding permission value is "DENIED" or "ALLOWED", override that value to the corresponding category permissions
* */
export const getUserCategoryPermissionsFunc = async (
  userId: string,
  categoryId: string,
  serverId: string
) => {
  let isAdmin = false;
  let isServerOwner = false;
  let combinedPermissions = {};

  const checkPermissionsQuery = createQuery(undefined, categoryId);
  const response = await graphQLClient().request(checkPermissionsQuery, {
    server_id: serverId,
    category_id: categoryId,
    channel_id: null,
    user_id: userId,
  });

  try {
    // Get server details and check if the user is the server owner
    const { server } = response;
    if (server.owner === userId) isServerOwner = true;
  } catch (error: any) {
    throw new Error("Error fetching server details: " + error.message);
  }

  // Fetch roles assigned to the user
  const { getRolesAssignedWithUser: roles } = response;
  const roleIds = roles.map((role: any) => role.id);

  // Fetch all category and channel permissions in parallel (with user-specific permission)
  let { categoryPermissions, userCategoryPermissions } = response;

  // Filter category and channel permissions with our roleIds
  categoryPermissions =
    categoryPermissions?.getCategoryRolesPermissions.filter((perm: any) =>
      roleIds.includes(perm.id)
    ) ?? null;

  // Combine permissions from roles
  for (const role of roles) {
    isAdmin = isAdmin || role.is_admin;

    // Parse role permissions
    const parsedRolePermissions = JSON.parse(role.permissions);

    // Apply category permissions if available
    const categoryPerm = categoryPermissions?.find(
      (perm: any) => perm.role_id === role.id
    );
    const parsedCategoryPerms = categoryPerm
      ? JSON.parse(categoryPerm.permissions)
      : {};

    // Merge role and category permissions
    const finalPermissions = {
      ...parsedRolePermissions,
      ...parsedCategoryPerms,
    };

    // Update the combinedPermissions
    for (const key in finalPermissions) {
      if (finalPermissions[key] === "ALLOWED") {
        // @ts-ignore
        combinedPermissions[key] = "ALLOWED";
      } else {
        // @ts-ignore
        if (!combinedPermissions[key]) {
          // @ts-ignore
          combinedPermissions[key] = "DENIED";
        }
      }
    }
  }

  const parsedUserCategoryPerms = userCategoryPermissions
    ? JSON.parse(userCategoryPermissions.permissions)
    : {};

  // Merge user-specific permissions into combinedPermissions
  const userFinalPermissions = {
    ...parsedUserCategoryPerms,
  };
  for (const key in userFinalPermissions) {
    if (userFinalPermissions[key] !== "DEFAULT") {
      // @ts-ignore
      combinedPermissions[key] = userFinalPermissions[key];
    }
  }

  // Apply isServerOwner or isAdmin override
  const finalFilteredPermissions = {};
  for (const key in CategoryPermissions) {
    if (combinedPermissions.hasOwnProperty(key)) {
      // @ts-ignore
      finalFilteredPermissions[key] =
        // @ts-ignore
        isServerOwner || isAdmin ? "ALLOWED" : combinedPermissions[key];
    }
  }

  return finalFilteredPermissions;
};
