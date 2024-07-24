import { Router } from 'express';
import {
  getCurrentUserStatus,
  getUserStatus,
  updateStatusText,
  updateStatusType,
} from '../controllers/user_status';
import { authMiddleware } from '../utils/authMiddleware';

const userStatusRouter = Router();

userStatusRouter.get('/', authMiddleware, getCurrentUserStatus);
userStatusRouter.get('/:id', authMiddleware, getUserStatus);

userStatusRouter.post('/type', authMiddleware, updateStatusType);
userStatusRouter.post('/custom', authMiddleware, updateStatusText);

export default userStatusRouter;
