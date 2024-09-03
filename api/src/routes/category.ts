import { Router } from "express";

import * as categoryCtrl from "../controllers/category";

const categoryRouter = Router();

// Category CRUD operations routes
categoryRouter.get("/categories/", categoryCtrl.getCategories);

categoryRouter.post("/categories/", categoryCtrl.createCategory);
categoryRouter.patch("/categories/:categoryId", categoryCtrl.updateCategory);

categoryRouter.delete("/categories/:categoryId", categoryCtrl.deleteCategory);

export default categoryRouter;
