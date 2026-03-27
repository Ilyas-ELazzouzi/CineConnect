import type { Router } from 'express';
import type { Db } from '../db/client.js';
import { requireAuth } from '../middlewares/auth.js';
import { createFilmRatingsController } from '../controllers/filmRatingsController.js';

export function registerFilmRatingRoutes(
  router: Router,
  opts: { db: Db; jwtSecret: string },
) {
  const controller = createFilmRatingsController(opts);
  router.get('/api/films/:imdbId/rating', controller.getRating);
  router.post('/api/films/:imdbId/rating', requireAuth(opts.jwtSecret), controller.setRating);
}
