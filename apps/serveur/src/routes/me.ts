import type { Router } from 'express';
import { z } from 'zod';
import type { Db } from '../db/client.js';
import { requireAuth, type AuthedRequest } from '../middlewares/auth.js';
import {
  getMeProfile,
  updateMeProfile,
  listMyPosts,
  listMyFilmComments,
} from '../services/profileService.js';

const optionalUrlOrEmpty = z.union([z.string().url(), z.literal('')]).nullable().optional();

const PatchProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  bio: z.string().max(500).nullable().optional(),
  avatarUrl: optionalUrlOrEmpty,
  coverUrl: optionalUrlOrEmpty,
});

export function registerMeRoutes(router: Router, opts: { db: Db; jwtSecret: string }) {
  router.get('/api/me/profile', requireAuth(opts.jwtSecret), async (req, res, next) => {
    try {
      const user = (req as AuthedRequest).user;
      const result = await getMeProfile(opts.db, user.id);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  });

  router.patch('/api/me/profile', requireAuth(opts.jwtSecret), async (req, res, next) => {
    try {
      const body = PatchProfileSchema.parse(req.body);
      const user = (req as AuthedRequest).user;
      const result = await updateMeProfile(opts.db, user.id, {
        ...(body.username !== undefined && { username: body.username }),
        ...(body.bio !== undefined && { bio: body.bio }),
        ...(body.avatarUrl !== undefined && {
          avatarUrl: body.avatarUrl === '' ? null : body.avatarUrl,
        }),
        ...(body.coverUrl !== undefined && {
          coverUrl: body.coverUrl === '' ? null : body.coverUrl,
        }),
      });
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  });

  router.get('/api/me/posts', requireAuth(opts.jwtSecret), async (req, res, next) => {
    try {
      const limit = Math.min(Number(req.query.limit) || 50, 100);
      const user = (req as AuthedRequest).user;
      const result = await listMyPosts(opts.db, user.id, limit);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  });

  router.get('/api/me/film-comments', requireAuth(opts.jwtSecret), async (req, res, next) => {
    try {
      const limit = Math.min(Number(req.query.limit) || 50, 100);
      const user = (req as AuthedRequest).user;
      const result = await listMyFilmComments(opts.db, user.id, limit);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  });
}
