import type { RequestHandler } from 'express';
import { z } from 'zod';
import type { Db } from '../db/client.js';
import { verifyAccessToken } from '../auth/jwt.js';
import type { AuthedRequest } from '../middlewares/auth.js';
import { listCommentsByImdbId, createFilmComment } from '../services/filmCommentsService.js';
import { setFilmCommentReaction } from '../services/filmCommentReactionsService.js';

const CreateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

const ReactionSchema = z.object({
  value: z.union([z.literal(1), z.literal(-1)]),
});

export type FilmCommentsControllerDeps = {
  db: Db;
  jwtSecret: string;
};

export function createFilmCommentsController(deps: FilmCommentsControllerDeps): {
  listByImdbId: RequestHandler;
  create: RequestHandler;
  setReaction: RequestHandler;
} {
  const listByImdbId: RequestHandler = async (req, res, next) => {
    try {
      const { imdbId } = req.params;
      if (!imdbId) {
        res.status(400).json({ error: 'imdbId requis' });
        return;
      }

      let currentUserId: string | undefined;
      const auth = req.header('authorization');
      if (auth?.toLowerCase().startsWith('bearer ')) {
        try {
          const payload = verifyAccessToken(auth.slice(7).trim(), deps.jwtSecret);
          currentUserId = payload.sub;
        } catch {
          // token invalid or expired, list without user reaction
        }
      }

      const result = await listCommentsByImdbId(deps.db, imdbId, currentUserId);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  };

  const create: RequestHandler = async (req, res, next) => {
    try {
      const { imdbId } = req.params;
      if (!imdbId) {
        res.status(400).json({ error: 'imdbId requis' });
        return;
      }

      const body = CreateCommentSchema.parse(req.body);
      const user = (req as AuthedRequest).user;
      const result = await createFilmComment(deps.db, imdbId, user.id, body.content);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  };

  const setReaction: RequestHandler = async (req, res, next) => {
    try {
      const { commentId } = req.params;
      if (!commentId) {
        res.status(400).json({ error: 'commentId requis' });
        return;
      }

      const body = ReactionSchema.parse(req.body);
      const user = (req as AuthedRequest).user;
      const result = await setFilmCommentReaction(deps.db, commentId, user.id, body.value);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  };

  return {
    listByImdbId,
    create,
    setReaction,
  };
}
