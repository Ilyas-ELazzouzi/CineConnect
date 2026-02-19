import type { Request } from 'express';
import { proxyOmdb } from '../omdb/proxy.js';

type OmdbEnv = {
  omdbApiKey: string | undefined;
};

function buildRequestUrl(req: Pick<Request, 'protocol' | 'get' | 'originalUrl'>): URL {
  const host = req.get('host') ?? 'localhost:3001';
  return new URL(`${req.protocol}://${host}${req.originalUrl}`);
}

export async function searchOmdbService(req: Request, env: OmdbEnv) {
  const url = buildRequestUrl(req);
  return proxyOmdb({ env, path: '/api/omdb/search', url });
}

export async function getMovieDetailsOmdbService(req: Request, env: OmdbEnv) {
  const imdbId = req.params.imdbId;
  const url = buildRequestUrl(req);
  return proxyOmdb({
    env,
    path: `/api/omdb/movie/${encodeURIComponent(imdbId)}`,
    url,
  });
}

