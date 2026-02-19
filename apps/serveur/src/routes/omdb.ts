import type { Router } from 'express';
import { getMovieDetailsOmdbService, searchOmdbService } from '../services/omdbService.js';

export function registerOmdbRoutes(router: Router, { omdbApiKey }: { omdbApiKey: string | undefined }) {
  router.get('/api/omdb/search', async (req, res, next) => {
    try {
      const result = await searchOmdbService(req, { omdbApiKey });
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  });

  router.get('/api/omdb/movie/:imdbId', async (req, res, next) => {
    try {
      const result = await getMovieDetailsOmdbService(req, { omdbApiKey });
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  });
}
