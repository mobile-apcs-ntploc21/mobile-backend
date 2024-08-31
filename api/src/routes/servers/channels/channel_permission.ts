import {
  addRoleToChannelPermission,
  addUserToChannelPermission, deleteRoleChannelPermission, deleteUserChannelPermission,
  getRoleAssignedWithChannel,
  getRolesAssignedWithChannel,
  getUserAssignedWithChannelPermission, getUserChannelPermissions,
  getUsersAssignedWithChannelPermission,
  updatePartialRoleChannelPermission, updatePartialUserChannelPermission,
  updateRoleChannelPermission,
  updateUserChannelPermission
} from "../../../controllers/servers/channels/channel_permission";
import {Router} from "express";
import {checkServerAdminMiddleware} from "../../../utils/checkServerAdminMiddleware";

const channelPermissionRouter = Router();

channelPermissionRouter.get(
  '/roles/permissions',
  checkServerAdminMiddleware,
  getRolesAssignedWithChannel
);

channelPermissionRouter.get(
  '/users/self/permissions',
  getUserChannelPermissions
)

channelPermissionRouter.get(
  '/users/permissions',
  checkServerAdminMiddleware,
  getUsersAssignedWithChannelPermission
);

channelPermissionRouter.get(
  '/roles/:roleId/permissions',
  checkServerAdminMiddleware,
  getRoleAssignedWithChannel
);

channelPermissionRouter.get(
  '/users/:userId/permissions',
  checkServerAdminMiddleware,
  getUserAssignedWithChannelPermission
);

channelPermissionRouter.post(
  '/roles/:roleId/permissions',
  checkServerAdminMiddleware,
  addRoleToChannelPermission
)

channelPermissionRouter.post(
  '/users/:userId/permissions',
  checkServerAdminMiddleware,
  addUserToChannelPermission
)

channelPermissionRouter.put(
  '/roles/:roleId/permissions',
  checkServerAdminMiddleware,
  updateRoleChannelPermission
)

channelPermissionRouter.put(
  '/users/:userId/permissions',
  checkServerAdminMiddleware,
  updateUserChannelPermission
)

channelPermissionRouter.patch(
  '/roles/:roleId/permissions',
  checkServerAdminMiddleware,
  updatePartialRoleChannelPermission
)

channelPermissionRouter.patch(
  '/users/:userId/permissions',
  checkServerAdminMiddleware,
  updatePartialUserChannelPermission
)

channelPermissionRouter.delete(
  '/roles/:roleId/permissions',
  checkServerAdminMiddleware,
  deleteRoleChannelPermission
)

channelPermissionRouter.delete(
  '/users/:userId/permissions',
  checkServerAdminMiddleware,
  deleteUserChannelPermission
)

export default channelPermissionRouter;