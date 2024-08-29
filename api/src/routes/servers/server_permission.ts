import {Router} from "express";

import * as serverRoles from "../../controllers/servers/server_permission"

import { checkMembershipMiddleware } from '../../utils/checkMembershipMiddleware';
import { authMiddleware } from '../../utils/authMiddleware';

const serverRoleRouter = Router();

// Server Role & Permissions
serverRoleRouter.get(
  '/',
  serverRoles.getServerRoles
);

serverRoleRouter.post(
  '/',
  serverRoles.createServerRole
);

serverRoleRouter.get(
  '/:roleId',
  serverRoles.getServerRole
);

serverRoleRouter.get(
  '/:roleId/permissions',
  serverRoles.getServerRolePermissions
);

serverRoleRouter.put(
  '/:roleId/permissions',
  serverRoles.updateServerRolePermissions
);

serverRoleRouter.patch(
  '/:roleId/permissions',
  serverRoles.updatePartialServerRolePermissions
);

serverRoleRouter.delete(
  '/:roleId',
  serverRoles.deleteServerRole
);

serverRoleRouter.patch(
  '/:roleId',
  serverRoles.updateServerRole
);

serverRoleRouter.get(
  '/:roleId/members',
  serverRoles.getServerRoleMembers
)

serverRoleRouter.post(
  '/:roleId/members/self',
  serverRoles.addMyselfToRole
);

serverRoleRouter.delete(
  '/:roleId/members/self',
  serverRoles.removeMyselfFromRole
);

serverRoleRouter.post(
  '/:roleId/members/:userId',
  serverRoles.addMemberToRole
);

serverRoleRouter.delete(
  '/:roleId/members/:userId',
  serverRoles.removeMemberFromRole
);

export default serverRoleRouter;