import graphQLClient from "./graphql";
import {
  serverCategoryPermissionQueries,
  serverChannelPermissionQueries,
  serverChannelQueries,
  serverQueries,
  serverRoleQueries,
} from "../graphql/queries";
import { ChannelPermissions } from "../constants/permissions";

// ======================
// This is for graphQL query
import { gql } from "graphql-request";

export const createQuery = (channelId?: string, categoryId?: string) => {
  const channelPart = channelId
    ? `
    getChannelRolesPermissions(channel_id: $channel_id) {
      id
      permissions
    }
    getChannelUserPermission(user_id: $user_id, channel_id: $channel_id) {
      permissions
    }`
    : "";

  const categoryPart = categoryId
    ? `
    getCategoryRolesPermissions(category_id: $category_id) {
      id
      permissions
    }
    getCategoryUserPermission(user_id: $user_id, category_id: $category_id) {
      permissions
    }`
    : "";

  const query = gql`
    query checkPermissions(
      $server_id: ID!,
      $user_id: ID!,
      ${channelId ? "$channel_id: ID!," : ""}
      ${categoryId ? "$category_id: ID!," : ""}
    ) {
      server(server_id: $server_id) {
        owner
      }
      getRolesAssignedWithUser(server_id: $server_id, user_id: $user_id) {
        id
        is_admin
        permissions
      }
      ${channelPart}
      ${categoryPart}
    }`;

  return query;
};

// ======================
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

  // Based on category_id being null or not
  const checkPermissionsQuery = createQuery(channelId, categoryId);

  // Checking the graphql query
  const response = await graphQLClient().request(checkPermissionsQuery, {
    server_id: serverId,
    category_id: categoryId,
    channel_id: channelId,
    user_id: userId,
  });

  try {
    // Get server details and check if the user is the server owner
    const { server } = response;
    if (server.owner === userId) isServerOwner = true;
  } catch (error) {
    throw new Error("Error fetching server details: " + error.message);
  }

  // Fetch roles assigned to the user
  const { getRolesAssignedWithUser: roles } = response;

  const roleIds = roles.map((role) => role.id);
  // Fetch all category and channel permissions in parallel (with user-specific permission)
  let categoryPermissions = response?.getCategoryRolesPermissions;
  let channelPermissions = response?.getChannelRolesPermissions;
  let userCategoryPermissions = response?.getCategoryUserPermission;
  let userChannelPermissions = response?.getChannelUserPermission;

  // Filter category and channel permissions with our roleIds
  categoryPermissions =
    categoryPermissions?.filter((perm) => roleIds.includes(perm.id)) ?? null;
  channelPermissions =
    channelPermissions?.filter((perm) => roleIds.includes(perm.id)) ?? null;

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
        // @ts-ignore
        combinedPermissions[key] = "ALLOWED";
      } else if (!combinedPermissions[key]) {
        // @ts-ignore
        combinedPermissions[key] = "DENIED";
      }
    }
  }

  const parsedUserCategoryPerms = userCategoryPermissions
    ? JSON.parse(userCategoryPermissions?.permissions)
    : {};
  const parsedUserChannelPerms = userChannelPermissions
    ? JSON.parse(userChannelPermissions?.permissions)
    : {};

  // Merge user-specific permissions into combinedPermissions
  const userFinalPermissions = {
    ...parsedUserCategoryPerms,
    ...parsedUserChannelPerms,
  };
  for (const key in userFinalPermissions) {
    if (userFinalPermissions[key] !== "DEFAULT") {
      // @ts-ignore
      combinedPermissions[key] = userFinalPermissions[key];
    }
  }

  // Apply isServerOwner or isAdmin override
  const finalFilteredPermissions = {};
  for (const key in ChannelPermissions) {
    if (combinedPermissions.hasOwnProperty(key)) {
      // @ts-ignore
      finalFilteredPermissions[key] =
        isServerOwner || isAdmin ? "ALLOWED" : combinedPermissions[key];
    }
  }

  return finalFilteredPermissions;
};
