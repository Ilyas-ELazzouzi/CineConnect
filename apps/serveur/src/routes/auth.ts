import type { Router } from 'express';
import { z } from 'zod';
import type { Db } from '../db/client.js';
import { requireAuth, type AuthedRequest } from '../middlewares/auth.js';
import { loginUserService, registerUserService } from '../services/authService.js';

const RegisterSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6).max(200),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

export function registerAuthRoutes(router: Router, opts: { db: Db; jwtSecret: string; jwtExpiresIn: string }) {
  router.post('/api/auth/register', async (req, res, next) => {
    try {
      const body = RegisterSchema.parse(req.body);
      const result = await registerUserService(opts.db, {
        jwtSecret: opts.jwtSecret,
        jwtExpiresIn: opts.jwtExpiresIn,
      }, body);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  });

  router.post('/api/auth/login', async (req, res, next) => {
    try {
      const body = LoginSchema.parse(req.body);
      const result = await loginUserService(opts.db, {
        jwtSecret: opts.jwtSecret,
        jwtExpiresIn: opts.jwtExpiresIn,
      }, body);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  });

  router.get('/api/auth/me', requireAuth(opts.jwtSecret), async (req, res) => {
    const user = (req as AuthedRequest).user;
    res.json({ user });
  });
}
