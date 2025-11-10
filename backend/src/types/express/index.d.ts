import { User } from '@zyerp/shared';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}