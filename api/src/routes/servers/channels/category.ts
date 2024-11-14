import { Router } from "express";
import categoryPermissionRouter from "./category_permission";
import { checkCategoryExistenceMiddleware } from "../../../utils/checkCategoryExistenceMiddleware";
import { checkServerPermissionMiddleware } from "../../../utils/checkServerPermissionMiddleware";
import { checkCategoryPermissionMiddleware } from "../../../utils/checkCategoryPermissionMiddleware";
import {
  BaseRolePermissions as BRP,
  CategoryPermissions as CP,
  ChannelPermissions as ChP,
} from "../../../constants/permissions";
import * as categoryCtrl from "../../../controllers/servers/channels/category";

const categoryRouter = Router({ mergeParams: true });

// ===== Swagger Components =====

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The Category ID
 *           example: 0123456789abcdef01234567
 *         server_id:
 *           type: string
 *           description: The Server ID
 *           example: 0123456789abcdef01234567
 *         name:
 *           type: string
 *           description: The Category name
 *           example: General
 *         position:
 *           type: integer
 *           description: The position of the Category in the Server
 *           example: 0
 */

// ==============================

// Move all category route
categoryRouter.patch(
  "/move",
  checkCategoryPermissionMiddleware([CP.MANAGE_CHANNEL]),
  categoryCtrl.moveAllCategory
);

// Category Role and User Permissions
categoryRouter.use(
  "/:categoryId",
  checkCategoryExistenceMiddleware,
  categoryPermissionRouter
);

// Category CRUD operations routes
categoryRouter.get(
  "/",
  checkCategoryPermissionMiddleware([CP.VIEW_CHANNEL]),
  categoryCtrl.getCategories
);

categoryRouter.post(
  "/",
  checkCategoryPermissionMiddleware([CP.MANAGE_CHANNEL]),
  categoryCtrl.createCategory
);
categoryRouter.patch(
  "/:categoryId",
  checkCategoryExistenceMiddleware,
  checkCategoryPermissionMiddleware([CP.MANAGE_CHANNEL]),
  categoryCtrl.updateCategory
);

categoryRouter.delete(
  "/:categoryId",
  checkCategoryExistenceMiddleware,
  checkCategoryPermissionMiddleware([CP.MANAGE_CHANNEL]),
  categoryCtrl.deleteCategory
);

categoryRouter.patch(
  "/:categoryId/move",
  checkCategoryExistenceMiddleware,
  checkCategoryPermissionMiddleware([CP.MANAGE_CHANNEL]),
  categoryCtrl.moveCategory
);

export default categoryRouter;
