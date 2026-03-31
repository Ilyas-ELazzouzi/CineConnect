import express, { type Express } from 'express';
import { registerHealthRoutes } from '../routes/health.js';
import { registerOmdbRoutes } from '../routes/omdb.js';
import { registerAuthRoutes } from '../routes/auth.js';
import { registerCommunityRoutes } from '../routes/community.js';
import { registerFilmCommentRoutes } from '../routes/filmComments.js';
import { registerFilmRatingRoutes } from '../routes/filmRatings.js';
import { registerMeRoutes } from '../routes/me.js';
import { registerUserPublicRoutes } from '../routes/users.js';
import { registerMessagesApiRoutes } from '../routes/messagesApi.js';
import type { AppDependencies } from './types.js';

export function registerApiRoutes(app: Express, deps: AppDependencies) {
  const router = express.Router();

  registerHealthRoutes(router);
  registerOmdbRoutes(router, { omdbApiKey: deps.env.OMDB_API_KEY });

  if (deps.db) {
    registerAuthRoutes(router, {
      db: deps.db,
      jwtSecret: deps.env.JWT_SECRET,
      jwtExpiresIn: deps.env.JWT_EXPIRES_IN,
      refreshTokenSecret: deps.env.REFRESH_TOKEN_SECRET ?? deps.env.JWT_SECRET,
      refreshTokenExpiresIn: deps.env.REFRESH_TOKEN_EXPIRES_IN,
      secureCookies: deps.env.NODE_ENV === 'production',
    });

    const securedRouteOpts = { db: deps.db, jwtSecret: deps.env.JWT_SECRET };
    registerCommunityRoutes(router, securedRouteOpts);
    registerFilmCommentRoutes(router, securedRouteOpts);
    registerFilmRatingRoutes(router, securedRouteOpts);
    registerMeRoutes(router, securedRouteOpts);
    registerUserPublicRoutes(router, securedRouteOpts);
    registerMessagesApiRoutes(router, securedRouteOpts);
  }

  app.use(router);
}
