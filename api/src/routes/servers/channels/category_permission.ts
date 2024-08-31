import {
  addRoleToCategoryPermission,
  addUserToCategoryPermission, deleteRoleCategoryPermission, deleteUserCategoryPermission,
  getRoleAssignedWithCategory,
  getRolesAssignedWithCategory,
  getUserAssignedWithCategoryPermission, getUserCategoryPermissions,
  getUsersAssignedWithCategoryPermission,
  updatePartialRoleCategoryPermission, updatePartialUserCategoryPermission,
  updateRoleCategoryPermission,
  updateUserCategoryPermission
} from "../../../controllers/servers/channels/category_permission";
import {Router} from "express";
import {checkServerAdminMiddleware} from "../../../utils/checkServerAdminMiddleware";

const categoryPermissionRouter = Router();

categoryPermissionRouter.get(
  '/roles/permissions',
  checkServerAdminMiddleware,
  getRolesAssignedWithCategory
);

categoryPermissionRouter.get(
  '/users/self/permissions',
  getUserCategoryPermissions
)

categoryPermissionRouter.get(
  '/users/permissions',
  checkServerAdminMiddleware,
  getUsersAssignedWithCategoryPermission
);

categoryPermissionRouter.get(
  '/roles/:roleId/permissions',
  checkServerAdminMiddleware,
  getRoleAssignedWithCategory
);

categoryPermissionRouter.get(
  '/users/:userId/permissions',
  checkServerAdminMiddleware,
  getUserAssignedWithCategoryPermission
);

categoryPermissionRouter.post(
  '/roles/:roleId/permissions',
  checkServerAdminMiddleware,
  addRoleToCategoryPermission
)

categoryPermissionRouter.post(
  '/users/:userId/permissions',
  checkServerAdminMiddleware,
  addUserToCategoryPermission
)

categoryPermissionRouter.put(
  '/roles/:roleId/permissions',
  checkServerAdminMiddleware,
  updateRoleCategoryPermission
)

categoryPermissionRouter.put(
  '/users/:userId/permissions',
  checkServerAdminMiddleware,
  updateUserCategoryPermission
)

categoryPermissionRouter.patch(
  '/roles/:roleId/permissions',
  checkServerAdminMiddleware,
  updatePartialRoleCategoryPermission
)

categoryPermissionRouter.patch(
  '/users/:userId/permissions',
  checkServerAdminMiddleware,
  updatePartialUserCategoryPermission
)

categoryPermissionRouter.delete(
  '/roles/:roleId/permissions',
  checkServerAdminMiddleware,
  deleteRoleCategoryPermission
)

categoryPermissionRouter.delete(
  '/users/:userId/permissions',
  checkServerAdminMiddleware,
  deleteUserCategoryPermission
)

export default categoryPermissionRouter;