import http from 'node:http';
import { loadDotEnv, getEnv } from './config/env.js';
import { createDb } from './db/client.js';
import { createApp } from './app.js';
import { attachSocketServer } from './socket/index.js';

loadDotEnv();
const env = getEnv();

const { db, pool } = createDb(env.DATABASE_URL);
const app = createApp({ env, db });
const server = http.createServer(app);

attachSocketServer(server, { env, db });

server.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('Erreur serveur:', err);
  process.exitCode = 1;
});

process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

if (process.env.NO_LISTEN === '1') {
  // eslint-disable-next-line no-console
  console.log('NO_LISTEN=1: serveur initialisé sans écoute réseau.');
} else {
  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Serveur CineConnect: http://localhost:${env.PORT}`);
    // eslint-disable-next-line no-console
    console.log(`Swagger: http://localhost:${env.PORT}/docs`);
  });
}
