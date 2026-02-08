import type { Router } from 'express';
import { proxyOmdb } from '../omdb/proxy.js';

export function registerOmdbRoutes(router: Router, { omdbApiKey }: { omdbApiKey: string | undefined }) {
  router.get('/api/omdb/search', async (req, res, next) => {
    try {
      const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
      const result = await proxyOmdb({ env: { omdbApiKey }, path: '/api/omdb/search', url });
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  });

  router.get('/api/omdb/movie/:imdbId', async (req, res, next) => {
    try {
      const imdbId = req.params.imdbId;
      const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
      const result = await proxyOmdb({
        env: { omdbApiKey },
        path: `/api/omdb/movie/${encodeURIComponent(imdbId)}`,
        url,
      });
      res.status(result.status).json(result.body);
    } catch (e) {
      next(e);
    }
  });
}
