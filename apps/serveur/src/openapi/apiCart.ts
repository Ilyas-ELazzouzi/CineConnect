import type { Env } from '../config/env.js';

export function buildOpenApiSpec(env: Env) {
  return {
    openapi: '3.0.3',
    info: {
      title: 'CineConnect API',
      version: '0.1.0',
    },
    servers: [{ url: `http://localhost:${env.PORT}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          responses: {
            '200': { description: 'OK' },
          },
        },
      },
      '/api/auth/register': {
        post: {
          summary: 'Register',
          requestBody: { required: true },
          responses: { '201': { description: 'Created' } },
        },
      },
      '/api/auth/login': {
        post: {
          summary: 'Login',
          requestBody: { required: true },
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/auth/me': {
        get: {
          summary: 'Me',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/omdb/search': {
        get: {
          summary: 'Proxy OMDb search',
          parameters: [
            { name: 's', in: 'query', required: true, schema: { type: 'string' } },
            { name: 'page', in: 'query', required: false, schema: { type: 'string' } },
          ],
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/omdb/movie/{imdbId}': {
        get: {
          summary: 'Proxy OMDb movie details',
          parameters: [{ name: 'imdbId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'OK' } },
        },
      },
    },
  };
}
