import { Router } from 'express';
import {
  getCurrentUserStatus,
  getUserStatus,
  updateStatusText,
  updateStatusType,
} from '../controllers/user_status';

const userStatusRouter = Router();

userStatusRouter.get('/', getCurrentUserStatus);
userStatusRouter.get('/:id', getUserStatus);

userStatusRouter.post('/type', updateStatusType);
userStatusRouter.post('/custom', updateStatusText);

export default userStatusRouter;
