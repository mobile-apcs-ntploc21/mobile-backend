import { Request, Response, NextFunction, Router } from "express";
import { createUser, loginUser, refresh } from "../controllers/user";
const userRouter = Router();

// Define your routes here
userRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Hello from user route" });

  // Call next middleware
});

// /login route
userRouter.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await loginUser(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// /register route
userRouter.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await createUser(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// /refresh route
userRouter.post(
  "/refresh",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await refresh(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

export default userRouter;
