import jwt from 'jsonwebtoken';
import UserModel from '../models/user';
import { config } from '../config';

export const getUserIdByToken = async (token: string): Promise<string> => {
  if (!token) throw new Error('Missing auth token');

  const decoded = jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload;
  const user = await UserModel.findById(decoded.id);
  if (!user)
    throw new Error('The user belonging to this token does no longer exist');

  return user.id;
};
