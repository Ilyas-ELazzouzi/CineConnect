import type { Router } from 'express';
import type { Db } from '../db/client.js';
import { requireAuth } from '../middlewares/auth.js';
import { createFilmCommentsController } from '../controllers/filmCommentsController.js';

export function registerFilmCommentRoutes(
  router: Router,
  opts: { db: Db; jwtSecret: string },
) {
  const controller = createFilmCommentsController(opts);
  router.get('/api/films/:imdbId/comments', controller.listByImdbId);
  router.post('/api/films/:imdbId/comments', requireAuth(opts.jwtSecret), controller.create);
  router.post(
    '/api/films/:imdbId/comments/:commentId/reaction',
    requireAuth(opts.jwtSecret),
    controller.setReaction,
  );
}
