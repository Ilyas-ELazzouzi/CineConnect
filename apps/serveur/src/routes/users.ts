import type { Router } from 'express';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import type { Db } from '../db/client.js';
import { users } from '../db/schema/index.js';
import { verifyAccessToken } from '../auth/jwt.js';
import { requireAuth, type AuthedRequest } from '../middlewares/auth.js';
import {
  getPublicProfile,
  listUserCommunityPosts,
  listFollowers,
  listFollowing,
  followUser,
  unfollowUser,
} from '../services/userRelationsService.js';

const uuidParam = z.string().uuid();

function viewerIdFromHeader(req: { header: (name: string) => string | undefined }, jwtSecret: string) {
  const auth = req.header('authorization');
  if (!auth?.toLowerCase().startsWith('bearer ')) return undefined;
  try {
    return verifyAccessToken(auth.slice(7).trim(), jwtSecret).sub;
  } catch {
    return undefined;
  }
}

async function userExists(db: Db, userId: string) {
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
  return !!row;
}

export function registerUserPublicRoutes(router: Router, opts: { db: Db; jwtSecret: string }) {
  router.get('/api/users/:userId/profile', async (req, res, next) => {
    try {
      const parsed = uuidParam.safeParse(req.params.userId);
      if (!parsed.success) {
        res.status(400).json({ error: 'Identifiant utilisateur invalide' });
        return;
      }
      const viewerId = viewerIdFromHeader(req, opts.jwtSecret);
      const result = await getPublicProfile(opts.db, parsed.data, viewerId);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  });

  router.get('/api/users/:userId/posts', async (req, res, next) => {
    try {
      const parsed = uuidParam.safeParse(req.params.userId);
      if (!parsed.success) {
        res.status(400).json({ error: 'Identifiant utilisateur invalide' });
        return;
      }
      if (!(await userExists(opts.db, parsed.data))) {
        res.status(404).json({ error: 'Utilisateur introuvable' });
        return;
      }
      const limit = Math.min(Number(req.query.limit) || 50, 100);
      const result = await listUserCommunityPosts(opts.db, parsed.data, limit);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  });

  router.get('/api/users/:userId/followers', async (req, res, next) => {
    try {
      const parsed = uuidParam.safeParse(req.params.userId);
      if (!parsed.success) {
        res.status(400).json({ error: 'Identifiant utilisateur invalide' });
        return;
      }
      if (!(await userExists(opts.db, parsed.data))) {
        res.status(404).json({ error: 'Utilisateur introuvable' });
        return;
      }
      const limit = Math.min(Number(req.query.limit) || 50, 100);
      const result = await listFollowers(opts.db, parsed.data, limit);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  });

  router.get('/api/users/:userId/following', async (req, res, next) => {
    try {
      const parsed = uuidParam.safeParse(req.params.userId);
      if (!parsed.success) {
        res.status(400).json({ error: 'Identifiant utilisateur invalide' });
        return;
      }
      if (!(await userExists(opts.db, parsed.data))) {
        res.status(404).json({ error: 'Utilisateur introuvable' });
        return;
      }
      const limit = Math.min(Number(req.query.limit) || 50, 100);
      const result = await listFollowing(opts.db, parsed.data, limit);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  });

  router.post('/api/users/:userId/follow', requireAuth(opts.jwtSecret), async (req, res, next) => {
    try {
      const parsed = uuidParam.safeParse(req.params.userId);
      if (!parsed.success) {
        res.status(400).json({ error: 'Identifiant utilisateur invalide' });
        return;
      }
      const follower = (req as AuthedRequest).user.id;
      const result = await followUser(opts.db, follower, parsed.data);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  });

  router.delete('/api/users/:userId/follow', requireAuth(opts.jwtSecret), async (req, res, next) => {
    try {
      const parsed = uuidParam.safeParse(req.params.userId);
      if (!parsed.success) {
        res.status(400).json({ error: 'Identifiant utilisateur invalide' });
        return;
      }
      const follower = (req as AuthedRequest).user.id;
      const result = await unfollowUser(opts.db, follower, parsed.data);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  });
}
