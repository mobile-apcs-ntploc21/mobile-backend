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
  serverId: string
) => {
  let isAdmin = false;
  let isServerOwner = false;
  let categoryId = null;

  try {
    // get server details
    const { server: server } = await graphQLClient().request(
      serverQueries.GET_SERVER_BY_ID,
      {
        server_id: serverId,
      }
    );

    if (server.owner === userId) {
      isServerOwner = true;
    }
  } catch (e) {
    throw new Error(e);
  }

  if (channelId) {
    try {
      // get category id associated with the channel, also check if the channel exists
      const { getChannel: channel } = await graphQLClient().request(
        serverChannelQueries.GET_CHANNEL,
        {
          channel_id: channelId,
        }
      );
      categoryId = channel.category_id;
    } catch (e) {
      throw new Error(e);
    }
  } else {
    categoryId = null; // The channel is not in any category
  }

  // get all server roles assigned with the current user
  const { getRolesAssignedWithUser: roles } = await graphQLClient().request(
    serverRoleQueries.GET_ROLES_ASSIGNED_WITH_USER,
    {
      server_id: serverId,
      user_id: userId,
    }
  );

  let combinedChannelPermissions = {};

  // for each server role, get the category permissions associated with that role (if exists)
  for (const role of roles) {
    isAdmin = isAdmin ? isAdmin : role.is_admin;
    let parsedServerRolePermissions = null;
    try {
      parsedServerRolePermissions = JSON.parse(role.permissions);
    } catch (error) {
      throw new Error(error);
    }

    let category = null;
    try {
      const response = await graphQLClient().request(
        serverCategoryPermissionQueries.GET_CATEGORY_ROLE_PERMISSION,
        {
          role_id: role.id,
          category_id: categoryId,
        }
      );
      category = response.getCategoryRolePermission;
    } catch (e) {
      // throw new Error(e);
    }

    if (category) {
      let parsedCategoryRolePermissions = null;
      try {
        parsedCategoryRolePermissions = JSON.parse(category.permissions);
      } catch (error) {
        throw new Error(error);
      }

      // Calculate the final category permissions associated with that role
      for (const key in parsedCategoryRolePermissions) {
        if (parsedCategoryRolePermissions[key] !== "DEFAULT") {
          parsedServerRolePermissions[key] = parsedCategoryRolePermissions[key];
        }
      }
    }

    let channel = null;
    if (channelId) {
      try {
        const response = await graphQLClient().request(
          serverChannelPermissionQueries.GET_CHANNEL_ROLE_PERMISSION,
          {
            role_id: role.id,
            channel_id: channelId,
          }
        );
        channel = response.getChannelRolePermission;
      } catch (e) {
        // throw new Error(e);
      }
    }

    if (channel) {
      let parsedChannelRolePermissions = null;
      try {
        parsedChannelRolePermissions = JSON.parse(channel.permissions);
      } catch (error) {
        throw new Error(error);
      }

      // Calculate the final category permissions associated with that role
      for (const key in parsedChannelRolePermissions) {
        if (parsedChannelRolePermissions[key] !== "DEFAULT") {
          parsedServerRolePermissions[key] = parsedChannelRolePermissions[key];
        }
      }
    }

    // Calculate the combined category permissions associated with those roles
    for (const key in parsedServerRolePermissions) {
      if (parsedServerRolePermissions[key] === "ALLOWED") {
        combinedChannelPermissions[key] = "ALLOWED";
      } else if (!combinedChannelPermissions[key]) {
        combinedChannelPermissions[key] = "DENIED";
      }
    }
  }

  let parsedUserPermissions = {};
  if (categoryId) {
    try {
      // get category permissions assigned with the current user (if exists)
      const { getCategoryUserPermission: user } = await graphQLClient().request(
        serverCategoryPermissionQueries.GET_CATEGORY_USER_PERMISSION,
        {
          user_id: userId,
          category_id: categoryId,
        }
      );

      parsedUserPermissions = JSON.parse(user.permissions);
    } catch (e) {
      // throw new Error(e);
    }
  }

  let parsedChannelUserPermissions = {};
  if (channelId) {
    try {
      // get category permissions assigned with the current user (if exists)
      const { getChannelUserPermission: user } = await graphQLClient().request(
        serverChannelPermissionQueries.GET_CHANNEL_USER_PERMISSION,
        {
          user_id: userId,
          channel_id: channelId,
        }
      );

      parsedChannelUserPermissions = JSON.parse(user.permissions);
    } catch (e) {
      // throw new Error(e);
    }
  }

  if (parsedChannelUserPermissions) {
    // Calculate the final category permissions associated with that user
    for (const key in parsedChannelUserPermissions) {
      if (parsedChannelUserPermissions[key] !== "DEFAULT") {
        parsedUserPermissions[key] = parsedChannelUserPermissions[key];
      }
    }
  }

  // Calculate the final category permissions associated with that user
  for (const key in parsedUserPermissions) {
    if (parsedUserPermissions[key] !== "DEFAULT") {
      combinedChannelPermissions[key] = parsedUserPermissions[key];
    }
  }

  // filter out permissions those are not associated with category permissions (based on CategoryPermissions)
  // iterate over CategoryPermissions and filter out the permissions that are not in the combinedChannelPermissions
  const filteredChannelPermissions = {};
  for (const key in ChannelPermissions) {
    if (combinedChannelPermissions.hasOwnProperty(key)) {
      filteredChannelPermissions[key] = combinedChannelPermissions[key];
      if (isServerOwner || isAdmin) {
        filteredChannelPermissions[key] = "ALLOWED";
      }
    }
  }

  return filteredChannelPermissions;
};
