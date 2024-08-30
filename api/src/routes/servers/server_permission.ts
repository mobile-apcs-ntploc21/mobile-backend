import {Router} from "express";

import * as serverRoles from "../../controllers/servers/server_permission"
import {checkServerAdminMiddleware} from '../../utils/checkServerAdminMiddleware';
import {checkServerPermissionMiddleware} from "../../utils/checkServerPermissionMiddleware";
import {ServerPermissions} from "../../constants/permissions";

const serverRoleRouter = Router();

// Server Role & Permissions
serverRoleRouter.get(
  '/',
  serverRoles.getServerRoles
);

serverRoleRouter.post(
  '/',
  checkServerAdminMiddleware,
  serverRoles.createServerRole
);

serverRoleRouter.get(
  '/default/permissions',
  checkServerAdminMiddleware,
  serverRoles.getDefaultServerRolePermissions
);

serverRoleRouter.put(
  '/default/permissions',
  checkServerAdminMiddleware,
  serverRoles.updateDefaultServerRolePermissions
);

serverRoleRouter.patch(
  '/default/permissions',
  checkServerAdminMiddleware,
  serverRoles.updatePartialDefaultServerRolePermissions
);

serverRoleRouter.get(
  '/:roleId',
  serverRoles.getServerRole
);

serverRoleRouter.delete(
  '/:roleId',
  checkServerAdminMiddleware,
  serverRoles.deleteServerRole
);

serverRoleRouter.patch(
  '/:roleId',
  checkServerAdminMiddleware,
  serverRoles.updateServerRole
);

serverRoleRouter.get(
  '/:roleId/permissions',
  checkServerAdminMiddleware,
  serverRoles.getServerRolePermissions
);

serverRoleRouter.put(
  '/:roleId/permissions',
  checkServerAdminMiddleware,
  serverRoles.updateServerRolePermissions
);

serverRoleRouter.patch(
  '/:roleId/permissions',
  checkServerAdminMiddleware,
  serverRoles.updatePartialServerRolePermissions
);

serverRoleRouter.get(
  '/:roleId/members',
  serverRoles.getServerRoleMembers
)

serverRoleRouter.post(
  '/:roleId/members/self',
  checkServerAdminMiddleware,
  serverRoles.addMyselfToRole
);

serverRoleRouter.delete(
  '/:roleId/members/self',
  serverRoles.removeMyselfFromRole
);

serverRoleRouter.post(
  '/:roleId/members/:userId',
  checkServerAdminMiddleware,
  serverRoles.addMemberToRole
);

serverRoleRouter.delete(
  '/:roleId/members/:userId',
  checkServerAdminMiddleware,
  serverRoles.removeMemberFromRole
);

export default serverRoleRouter;
