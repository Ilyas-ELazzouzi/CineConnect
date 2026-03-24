import type { Router } from 'express';
import { z } from 'zod';
import type { Db } from '../db/client.js';
import { requireAuth, type AuthedRequest } from '../middlewares/auth.js';
import { verifyAccessToken } from '../auth/jwt.js';
import { listCommentsByImdbId, createFilmComment } from '../services/filmCommentsService.js';
import { setFilmCommentReaction } from '../services/filmCommentReactionsService.js';

const CreateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

const ReactionSchema = z.object({
  value: z.union([z.literal(1), z.literal(-1)]),
});

export function registerFilmCommentRoutes(
  router: Router,
  opts: { db: Db; jwtSecret: string },
) {
  router.get('/api/films/:imdbId/comments', async (req, res, next) => {
    try {
      const { imdbId } = req.params;
      if (!imdbId) return res.status(400).json({ error: 'imdbId requis' });
      let currentUserId: string | undefined;
      const auth = req.header('authorization');
      if (auth?.toLowerCase().startsWith('bearer ')) {
        try {
          const payload = verifyAccessToken(auth.slice(7).trim(), opts.jwtSecret);
          currentUserId = payload.sub;
        } catch {
          // token invalid or expired, list without user reaction
        }
      }
      const result = await listCommentsByImdbId(opts.db, imdbId, currentUserId);
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
        if (!imdbId) return res.status(400).json({ error: 'imdbId requis' });
        const body = CreateCommentSchema.parse(req.body);
        const user = (req as AuthedRequest).user;
        const result = await createFilmComment(opts.db, imdbId, user.id, body.content);
        res.status(result.status).json(result.body);
      } catch (e) {
        next(e);
      }
    },
  );

  router.post(
    '/api/films/:imdbId/comments/:commentId/reaction',
    requireAuth(opts.jwtSecret),
    async (req, res, next) => {
      try {
        const { commentId } = req.params;
        if (!commentId) return res.status(400).json({ error: 'commentId requis' });
        const body = ReactionSchema.parse(req.body);
        const user = (req as AuthedRequest).user;
        const result = await setFilmCommentReaction(opts.db, commentId, user.id, body.value);
        res.status(result.status).json(result.body);
      } catch (e) {
        next(e);
      }
    },
  );
}
