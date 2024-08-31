import graphQLClient from "./graphql";
import {serverCategoryPermissionQueries, serverQueries, serverRoleQueries} from "../graphql/queries";
import {CategoryPermissions} from "../constants/permissions";

/*
* - get all server roles assigned with the current user
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
)=> {
  let isAdmin = false;
  let isServerOwner = false;

  try {
    // get server details
    const {server: server} = await graphQLClient().request(
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

  // get all server roles assigned with the current user
  const { getRolesAssignedWithUser: roles } = await graphQLClient().request(
    serverRoleQueries.GET_ROLES_ASSIGNED_WITH_USER,
    {
      server_id: serverId,
      user_id: userId,
    }
  );

  let combinedCategoryPermissions = {};

  // for each server role, get the category permissions associated with that role (if exists)
  for (const role of roles) {
    isAdmin = (isAdmin ? isAdmin : role.is_admin);
    let parsedServerRolePermissions = null;
    try {
      parsedServerRolePermissions = JSON.parse(role.permissions);
    } catch (error) {
      throw new Error(error);
    }

    let category = null
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

    // Calculate the combined category permissions associated with those roles
    for (const key in parsedServerRolePermissions) {
      if (parsedServerRolePermissions[key] === "ALLOWED") {
        combinedCategoryPermissions[key] = "ALLOWED";
      } else if (!combinedCategoryPermissions[key]) {
        combinedCategoryPermissions[key] = "DENIED";
      }
    }
  }

  let parsedUserPermissions = null;
  try {
    // get category permissions assigned with the current user (if exists)
    const {getCategoryUserPermission: user} = await graphQLClient().request(
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

  if (parsedUserPermissions) {
    // Calculate the final category permissions associated with that user
    for (const key in parsedUserPermissions) {
      if (parsedUserPermissions[key] !== "DEFAULT") {
        combinedCategoryPermissions[key] = parsedUserPermissions[key];
      }
    }
  }

  // filter out permissions those are not associated with category permissions (based on CategoryPermissions)
  // iterate over CategoryPermissions and filter out the permissions that are not in the combinedCategoryPermissions
  const filteredCategoryPermissions = {};
  for (const key in CategoryPermissions) {
    if (combinedCategoryPermissions.hasOwnProperty(key)) {
      filteredCategoryPermissions[key] = combinedCategoryPermissions[key];
      if (isServerOwner || isAdmin) {
        filteredCategoryPermissions[key] = "ALLOWED";
      }
    }
  }

  return filteredCategoryPermissions;
}
