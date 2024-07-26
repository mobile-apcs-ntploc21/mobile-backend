import { Router } from 'express';
import {
  getCurrentUserStatus,
  getMultipleUserStatus,
  getUserStatus,
  updateStatusText,
  updateStatusType,
} from '../controllers/user_status';

const userStatusRouter = Router();

userStatusRouter.get('/', getCurrentUserStatus);
userStatusRouter.get('/multiple', getMultipleUserStatus);
userStatusRouter.get('/:id', getUserStatus);

userStatusRouter.post('/type', updateStatusType);
userStatusRouter.post('/custom', updateStatusText);

export default userStatusRouter;
