import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../auth/jwt.js';

export type AuthUser = {
  id: string;
  username: string;
  email: string;
};

export type AuthedRequest = Request & { user: AuthUser };

export function requireAuth(jwtSecret: string) {
  return function middleware(req: Request, res: Response, next: NextFunction) {
    const auth = req.header('authorization');
    if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const token = auth.slice('bearer '.length).trim();
    try {
      const payload = verifyAccessToken(token, jwtSecret);
      (req as AuthedRequest).user = {
        id: payload.sub,
        username: payload.username,
        email: payload.email,
      };
      next();
    } catch {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
}
