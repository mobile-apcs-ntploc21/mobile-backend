import { Request, Response, NextFunction, Router } from "express";
import {
  createUser,
  loginUser,
  refresh,
  getMe,
  logoutUser,
} from "../controllers/user";
import { authMiddleware } from "../utils/authMiddleware";
const userRouter = Router();

// Define your routes here
userRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Hello from user route" });

  // Call next middleware
});

// Login user
userRouter.post("/login", loginUser);
// Register user
userRouter.post("/register", createUser);
// Refresh token
userRouter.post("/refresh", refresh);
// Get user
userRouter.get("/me", authMiddleware, getMe);
// Logout user
userRouter.post("/logout", authMiddleware, logoutUser);
// Clear all devices
// userRouter.delete("/logout", authMiddleware);

export default userRouter;
