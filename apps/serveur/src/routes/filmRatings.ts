import type { Router } from 'express';
import { z } from 'zod';
import type { Db } from '../db/client.js';
import { requireAuth, type AuthedRequest } from '../middlewares/auth.js';
import { verifyAccessToken } from '../auth/jwt.js';
import { getFilmRatingInfo, setFilmRating } from '../services/filmRatingsService.js';

const SetRatingSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
});

export function registerFilmRatingRoutes(
  router: Router,
  opts: { db: Db; jwtSecret: string },
) {
  router.get('/api/films/:imdbId/rating', async (req, res, next) => {
    try {
      const { imdbId } = req.params;
      if (!imdbId) return res.status(400).json({ error: 'imdbId requis' });
      let userId: string | undefined;
      const auth = req.header('authorization');
      if (auth?.toLowerCase().startsWith('bearer ')) {
        try {
          const payload = verifyAccessToken(auth.slice(7).trim(), opts.jwtSecret);
          userId = payload.sub;
        } catch {
          // optional: list without user rating
        }
      }
      const result = await getFilmRatingInfo(opts.db, imdbId, userId);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  });

  router.post(
    '/api/films/:imdbId/rating',
    requireAuth(opts.jwtSecret),
    async (req, res, next) => {
      try {
        const { imdbId } = req.params;
        if (!imdbId) return res.status(400).json({ error: 'imdbId requis' });
        const body = SetRatingSchema.parse(req.body);
        const user = (req as AuthedRequest).user;
        const result = await setFilmRating(opts.db, imdbId, user.id, body.rating);
        res.status(result.status).json(result.body);
      } catch (e) {
        next(e);
      }
    },
  );
}
