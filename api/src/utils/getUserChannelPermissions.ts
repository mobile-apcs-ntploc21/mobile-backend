import graphQLClient from "./graphql";
import {
  serverCategoryPermissionQueries,
  serverChannelPermissionQueries,
  serverChannelQueries,
  serverQueries,
  serverRoleQueries,
} from "../graphql/queries";
import { ChannelPermissions } from "../constants/permissions";

/*
- get all server roles assigned with the current user
- for each server role, get the channel permissions associated with that role
    + If there exists a category permissions associated with the current role (that category includes the current channel), calculate the final category permissions associated with that role
        * The way we combine is, if the category permission is "DEFAULT", then it will inherit the permission value from server role permissions
        * Otherwise, keep it (in other word, if the value associated with the corresponding category permission is "ALLOWED" or "DENIED", keep it)
    + Otherwise, the final category permission associated with that role is the server role permissions

    + If there exists a channel permissions associated with the current role, calculate the final channel permissions associated with that role (do the same as above)
- Calculate the combined channel permissions associated with those roles
    * That is, for each permission, if there exists a role with permission value "ALLOWED", the corresponding permission value will be "ALLOWED", otherwise, "DENIED"
- get channel permissions assigned with the current user (if exists)
    + If there exists a category permissions assigned with the current user (that cateogry includes the current channel), calculate the final category permissions associated with this user
        * If the corresponding permission value is "DENIED" or "ALLOWED", override that value to the corresponding category permissions
    + If there exists a channel permissions assigned with the current user, calculate the final channel permissions associated with this user (do the same as above)
* */
export const getUserChannelPermissionsFunc = async (
  userId: string,
  channelId: string,
  serverId: string,
  extra?: any
) => {
  let isAdmin = false;
  let isServerOwner = false;
  let categoryId = extra?.channelObject?.category_id ?? null;
  let combinedPermissions = {};

  try {
    // Get server details and check if the user is the server owner
    const { server } = await graphQLClient().request(
      serverQueries.GET_SERVER_BY_ID,
      { server_id: serverId }
    );
    if (server.owner === userId) isServerOwner = true;
  } catch (error) {
    throw new Error("Error fetching server details: " + error.message);
  }

  // Fetch roles assigned to the user
  const { getRolesAssignedWithUser: roles } = await graphQLClient().request(
    serverRoleQueries.GET_ROLES_ASSIGNED_WITH_USER,
    { server_id: serverId, user_id: userId }
  );

  // Fetch all category and channel permissions in parallel
  const roleIds = roles.map((role) => role.id);
  let [categoryPermissions, channelPermissions] = await Promise.all([
    categoryId
      ? graphQLClient().request(
          serverCategoryPermissionQueries.GET_CATEGORY_ROLES_PERMISSION,
          {
            role_ids: roleIds,
            category_id: categoryId,
          }
        )
      : null,
    channelId
      ? graphQLClient().request(
          serverChannelPermissionQueries.GET_CHANNEL_ROLES_PERMISSION,
          {
            role_ids: roleIds,
            channel_id: channelId,
          }
        )
      : null,
  ]);

  // Filter category and channel permissions with our roleIds
  categoryPermissions =
    categoryPermissions?.getCategoryRolesPermissions.filter((perm) =>
      roleIds.includes(perm.id)
    ) ?? null;
  channelPermissions =
    channelPermissions?.getChannelRolesPermissions.filter((perm) =>
      roleIds.includes(perm.id)
    ) ?? null;

  // Combine permissions from roles
  for (const role of roles) {
    isAdmin = isAdmin || role.is_admin;

    // Parse role permissions
    const parsedRolePermissions = JSON.parse(role.permissions);

    // Apply category permissions if available
    const categoryPerm = categoryPermissions?.find(
      (perm) => perm.role_id === role.id
    );
    const parsedCategoryPerms = categoryPerm
      ? JSON.parse(categoryPerm.permissions)
      : {};

    // Apply channel permissions if available
    const channelPerm = channelPermissions?.find(
      (perm) => perm.role_id === role.id
    );
    const parsedChannelPerms = channelPerm
      ? JSON.parse(channelPerm.permissions)
      : {};

    // Merge role, category, and channel permissions
    const finalPermissions = {
      ...parsedRolePermissions,
      ...parsedCategoryPerms,
      ...parsedChannelPerms,
    };

    // Update the combinedPermissions
    for (const key in finalPermissions) {
      if (finalPermissions[key] === "ALLOWED") {
        combinedPermissions[key] = "ALLOWED";
      } else if (!combinedPermissions[key]) {
        combinedPermissions[key] = "DENIED";
      }
    }
  }

  // Handle user-specific permissions
  const [userCategoryPermissions, userChannelPermissions] = await Promise.all([
    categoryId
      ? graphQLClient()
          .request(
            serverCategoryPermissionQueries.GET_CATEGORY_USER_PERMISSION,
            {
              user_id: userId,
              category_id: categoryId,
            }
          )
          .catch((e) => {})
      : null,
    channelId
      ? graphQLClient()
          .request(serverChannelPermissionQueries.GET_CHANNEL_USER_PERMISSION, {
            user_id: userId,
            channel_id: channelId,
          })
          .catch((e) => {})
      : null,
  ]);

  const parsedUserCategoryPerms = userCategoryPermissions
    ? JSON.parse(userCategoryPermissions.permissions)
    : {};
  const parsedUserChannelPerms = userChannelPermissions
    ? JSON.parse(userChannelPermissions.permissions)
    : {};

  // Merge user-specific permissions into combinedPermissions
  const userFinalPermissions = {
    ...parsedUserCategoryPerms,
    ...parsedUserChannelPerms,
  };
  for (const key in userFinalPermissions) {
    if (userFinalPermissions[key] !== "DEFAULT") {
      combinedPermissions[key] = userFinalPermissions[key];
    }
  }

  // Apply isServerOwner or isAdmin override
  const finalFilteredPermissions = {};
  for (const key in ChannelPermissions) {
    if (combinedPermissions.hasOwnProperty(key)) {
      finalFilteredPermissions[key] =
        isServerOwner || isAdmin ? "ALLOWED" : combinedPermissions[key];
    }
  }

  return finalFilteredPermissions;
};
