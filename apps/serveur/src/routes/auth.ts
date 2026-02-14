import type { Router } from 'express';
import { z } from 'zod';
import { eq, or } from 'drizzle-orm';
import { users } from '../db/schema/index.js';
import type { Db } from '../db/client.js';
import { hashPassword, verifyPassword } from '../auth/password.js';
import { signAccessToken } from '../auth/jwt.js';
import { requireAuth, type AuthedRequest } from '../middlewares/auth.js';

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
      const existing = await opts.db
        .select({ id: users.id })
        .from(users)
        .where(or(eq(users.email, body.email), eq(users.username, body.username)))
        .limit(1);
      if (existing.length > 0) {
        res.status(409).json({ error: 'Utilisateur déjà existant' });
        return;
      }

      const passwordHash = await hashPassword(body.password);
      const inserted = await opts.db
        .insert(users)
        .values({
          username: body.username,
          email: body.email,
          passwordHash,
        })
        .returning({ id: users.id, username: users.username, email: users.email });

      const user = inserted[0];
      if (!user) {
        res.status(500).json({ error: "Impossible de créer l'utilisateur" });
        return;
      }

      const token = signAccessToken(
        { sub: user.id, username: user.username, email: user.email },
        opts.jwtSecret,
        opts.jwtExpiresIn,
      );
      res.status(201).json({ token, user });
    } catch (e) {
      next(e);
    }
  });

  router.post('/api/auth/login', async (req, res, next) => {
    try {
      const body = LoginSchema.parse(req.body);
      const found = await opts.db
        .select({ id: users.id, username: users.username, email: users.email, passwordHash: users.passwordHash })
        .from(users)
        .where(eq(users.email, body.email))
        .limit(1);
      const user = found[0];
      if (!user) {
        res.status(401).json({ error: 'Identifiants invalides' });
        return;
      }

      const ok = await verifyPassword(body.password, user.passwordHash);
      if (!ok) {
        res.status(401).json({ error: 'Identifiants invalides' });
        return;
      }

      const token = signAccessToken(
        { sub: user.id, username: user.username, email: user.email },
        opts.jwtSecret,
        opts.jwtExpiresIn,
      );
      res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (e) {
      next(e);
    }
  });

  router.get('/api/auth/me', requireAuth(opts.jwtSecret), async (req, res) => {
    const user = (req as AuthedRequest).user;
    res.json({ user });
  });
}
