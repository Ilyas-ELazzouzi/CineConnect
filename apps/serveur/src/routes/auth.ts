import type { Router } from 'express';
import type { Db } from '../db/client.js';
import { requireAuth } from '../middlewares/auth.js';
import { createAuthController } from '../controllers/authController.js';

export function registerAuthRoutes(
  router: Router,
  opts: {
    db: Db;
    jwtSecret: string;
    jwtExpiresIn: string;
    refreshTokenSecret: string;
    refreshTokenExpiresIn: string;
    secureCookies: boolean;
  },
) {
  const controller = createAuthController(opts);
  router.post('/api/auth/register', controller.register);
  router.post('/api/auth/login', controller.login);
  router.post('/api/auth/refresh', controller.refresh);
  router.post('/api/auth/logout', controller.logout);
  router.get('/api/auth/me', requireAuth(opts.jwtSecret), controller.me);
}
