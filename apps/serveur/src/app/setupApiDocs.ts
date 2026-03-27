import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { buildOpenApiSpec } from '../openapi/apiCart.js';
import type { AppDependencies } from './types.js';

export function setupApiDocs(app: Express, deps: Pick<AppDependencies, 'env'>) {
  const spec = buildOpenApiSpec(deps.env);
  app.get('/openapi.json', (_req, res) => res.json(spec));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
}
