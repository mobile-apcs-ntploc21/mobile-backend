import { Request, Response, NextFunction, Router } from "express";
import { login, register, refresh, aboutMe } from "../lib/auth";
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
      await login(req, res);
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
      await register(req, res);
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
      await refresh(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// /me route
userRouter.post(
  "/me",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await aboutMe(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default userRouter;
