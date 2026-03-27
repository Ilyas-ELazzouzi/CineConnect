import express from 'express';
import type { AppDependencies } from './app/types.js';
import { setupCors } from './app/setupCors.js';
import { registerApiRoutes } from './app/registerApiRoutes.js';
import { setupApiDocs } from './app/setupApiDocs.js';
import { setupClientApp } from './app/setupClientApp.js';
import { errorHandler } from './middlewares/error.js';

export function createApp(deps: AppDependencies) {
  const app = express();
  app.disable('x-powered-by');

  setupCors(app, deps.env.CORS_ORIGINS);
  app.use(express.json({ limit: '1mb' }));
  registerApiRoutes(app, deps);
  setupApiDocs(app, deps);
  setupClientApp(app);

  app.use(errorHandler);
  return app;
}
