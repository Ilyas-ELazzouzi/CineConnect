import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import type { Env } from './config/env.js';
import { parseCorsOrigins } from './config/cors.js';
import type { Db } from './db/client.js';
import { registerHealthRoutes } from './routes/health.js';
import { registerOmdbRoutes } from './routes/omdb.js';
import { registerAuthRoutes } from './routes/auth.js';
import { buildOpenApiSpec } from './openapi/spec.js';
import { errorHandler } from './middlewares/error.js';

export function createApp(opts: { env: Env; db?: Db }) {
  const { env, db } = opts;

  const app = express();
  app.disable('x-powered-by');

  const isAllowedOrigin = parseCorsOrigins(env.CORS_ORIGINS);
  app.use(
    cors({
      origin(
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void,
      ) {
        if (!origin) return callback(null, false);
        return callback(null, isAllowedOrigin(origin));
      },
      credentials: true,
      allowedHeaders: ['content-type', 'authorization', 'x-request-id'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  );

  app.use(express.json({ limit: '1mb' }));

  const router = express.Router();
  registerHealthRoutes(router);
  registerOmdbRoutes(router, { omdbApiKey: env.OMDB_API_KEY });
  if (db) {
    registerAuthRoutes(router, { db, jwtSecret: env.JWT_SECRET, jwtExpiresIn: env.JWT_EXPIRES_IN });
  }
  app.use(router);

  const spec = buildOpenApiSpec(env);
  app.get('/openapi.json', (_req, res) => res.json(spec));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));

  app.use(errorHandler);
  return app;
}
