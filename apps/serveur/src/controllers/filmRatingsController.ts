import type { RequestHandler } from 'express';
import { z } from 'zod';
import type { Db } from '../db/client.js';
import { verifyAccessToken } from '../auth/jwt.js';
import type { AuthedRequest } from '../middlewares/auth.js';
import { getFilmRatingInfo, setFilmRating } from '../services/filmRatingsService.js';

const SetRatingSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
});

export type FilmRatingsControllerDeps = {
  db: Db;
  jwtSecret: string;
};

export function createFilmRatingsController(deps: FilmRatingsControllerDeps): {
  getRating: RequestHandler;
  setRating: RequestHandler;
} {
  const getRating: RequestHandler = async (req, res, next) => {
    try {
      const { imdbId } = req.params;
      if (!imdbId) {
        res.status(400).json({ error: 'imdbId requis' });
        return;
      }

      let userId: string | undefined;
      const auth = req.header('authorization');
      if (auth?.toLowerCase().startsWith('bearer ')) {
        try {
          const payload = verifyAccessToken(auth.slice(7).trim(), deps.jwtSecret);
          userId = payload.sub;
        } catch {
          // optional: list without user rating
        }
      }

      const result = await getFilmRatingInfo(deps.db, imdbId, userId);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  };

  const setRating: RequestHandler = async (req, res, next) => {
    try {
      const { imdbId } = req.params;
      if (!imdbId) {
        res.status(400).json({ error: 'imdbId requis' });
        return;
      }

      const body = SetRatingSchema.parse(req.body);
      const user = (req as AuthedRequest).user;
      const result = await setFilmRating(deps.db, imdbId, user.id, body.rating);
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  };

  return {
    getRating,
    setRating,
  };
}
