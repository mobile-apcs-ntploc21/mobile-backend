import {Router} from "express";
import categoryPermissionRouter from "./category_permission";

const categoryRouter = Router();

// Category Role and User Permissions
categoryRouter.use(
  '/',
  categoryPermissionRouter
)

export default categoryRouter;
