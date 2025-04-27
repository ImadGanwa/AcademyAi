import { Request } from 'express';
import { IUser } from '../models/User';

export interface RequestUser {
  id: string;
  role: string;
  _id: string;
  email: string;
  fullName: string;
}

export interface RequestWithUser extends Request {
  user?: RequestUser;
} 