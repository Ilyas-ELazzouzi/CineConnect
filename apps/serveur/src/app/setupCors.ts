import type { Express } from 'express';
import cors from 'cors';
import { parseCorsOrigins } from '../config/cors.js';

export function setupCors(app: Express, corsOrigins: string[]) {
  const isAllowedOrigin = parseCorsOrigins(corsOrigins);

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
}
