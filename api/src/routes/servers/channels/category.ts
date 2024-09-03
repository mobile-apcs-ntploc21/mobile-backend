import { Router } from "express";
import categoryPermissionRouter from "./category_permission";
import { checkCategoryExistenceMiddleware } from "../../../utils/checkCategoryExistenceMiddleware";
import { checkServerPermissionMiddleware } from "../../../utils/checkServerPermissionMiddleware";
import {
  BaseRolePermissions as BRP,
  CategoryPermissions,
  ChannelPermissions,
} from "../../../constants/permissions";
import * as categoryCtrl from "../../../controllers/servers/channels/category";

const categoryRouter = Router({ mergeParams: true });

// Category Role and User Permissions
categoryRouter.use(
  "/:categoryId",
  checkCategoryExistenceMiddleware,
  categoryPermissionRouter
);

// Category CRUD operations routes
categoryRouter.get("/", categoryCtrl.getCategories);

categoryRouter.post("/", categoryCtrl.createCategory);
categoryRouter.patch(
  "/:categoryId",
  checkCategoryExistenceMiddleware,
  categoryCtrl.updateCategory
);

categoryRouter.delete(
  "/:categoryId",
  checkCategoryExistenceMiddleware,
  categoryCtrl.deleteCategory
);

categoryRouter.patch(
  "/:categoryId/move",
  checkCategoryExistenceMiddleware,
  categoryCtrl.moveCategory
);

export default categoryRouter;
