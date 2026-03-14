import type { Router } from 'express';
import { z } from 'zod';
import type { Db } from '../db/client.js';
import { requireAuth, type AuthedRequest } from '../middlewares/auth.js';
import { listCommentsByImdbId, createFilmComment } from '../services/filmCommentsService.js';

const CreateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export function registerFilmCommentRoutes(
  router: Router,
  opts: { db: Db; jwtSecret: string },
) {
  router.get('/api/films/:imdbId/comments', async (req, res, next) => {
    try {
      const { imdbId } = req.params;
      const result = await listCommentsByImdbId(opts.db, imdbId);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  });

  router.post(
    '/api/films/:imdbId/comments',
    requireAuth(opts.jwtSecret),
    async (req, res, next) => {
      try {
        const { imdbId } = req.params;
        const body = CreateCommentSchema.parse(req.body);
        const user = (req as AuthedRequest).user;
        const result = await createFilmComment(opts.db, imdbId, user.id, body.content);
        res.status(result.status).json(result.body);
      } catch (e) {
        next(e);
      }
    },
  );
}
