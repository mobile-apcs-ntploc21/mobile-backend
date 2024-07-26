import { Router } from 'express';
import {
  getCurrentUserStatus,
  getMultipleUserStatus,
  getUserStatus,
  updateStatusText,
  updateStatusType,
} from '../controllers/user_status';

const userStatusRouter = Router();

userStatusRouter.get('/status', getCurrentUserStatus);
userStatusRouter.get('/statuses', getMultipleUserStatus);
userStatusRouter.get('/status/:id', getUserStatus);

userStatusRouter.post('/status/type', updateStatusType);
userStatusRouter.post('/status/custom', updateStatusText);

export default userStatusRouter;
