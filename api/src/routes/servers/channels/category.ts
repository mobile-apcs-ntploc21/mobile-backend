import { Router } from "express";
import categoryPermissionRouter from "./category_permission";
import * as categoryCtrl from "../../../controllers/servers/channels/category";

const categoryRouter = Router({ mergeParams: true });

// Category Role and User Permissions
categoryRouter.use("/", categoryPermissionRouter);

// Category CRUD operations routes
categoryRouter.post("/", categoryCtrl.createCategory);
categoryRouter.patch("/:categoryId", categoryCtrl.updateCategory);

categoryRouter.delete("/:categoryId", categoryCtrl.deleteCategory);

export default categoryRouter;
