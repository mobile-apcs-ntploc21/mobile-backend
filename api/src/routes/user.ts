import { Request, Response, NextFunction, Router } from 'express';
const userRouter = Router();

// Define your routes here
userRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: 'Hello from user route' });

    // Call next middleware
});

export default userRouter;