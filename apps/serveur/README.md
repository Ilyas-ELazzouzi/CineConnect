# Serveur CineConnect (backend)

Backend de l'application CineConnect (monorepo pnpm).

## Stack backend (implémentée)

- Node.js + **Express**
- **Drizzle ORM** + PostgreSQL (via `pg`)
- Authentification **JWT**
- **WebSocket** via **Socket.io** (discussion temps réel)
- **Swagger UI** (OpenAPI)
- Tests **Vitest** (+ Supertest)

# Démarrage

```bash
# Depuis la racine du monorepo
pnpm dev:server

# Ou depuis ce dossier
pnpm dev
```

# Configuration

Copie `/Users/ouchenedihya/Desktop/les projet 2 éme /CineConnect/apps/serveur/.env.example` vers `.env` puis renseigne `OMDB_API_KEY`.

Variables d’environnement:

- `PORT` (défaut: `3001`)
- `NODE_ENV` (`development|test|production`)
- `DATABASE_URL` (PostgreSQL)
- `JWT_SECRET` + `JWT_EXPIRES_IN`
- `OMDB_API_KEY` (proxy OMDb)
- `CORS_ORIGINS` (défaut: `http://localhost:5173,http://127.0.0.1:5173`)

# Scripts

Définis dans `/Users/ouchenedihya/Desktop/les projet 2 éme /CineConnect/apps/serveur/package.json`:

- `pnpm dev` : `tsx watch src/index.ts`
- `pnpm build` : `tsc -p tsconfig.build.json`
- `pnpm start` : `node dist/index.js`
- `pnpm typecheck` : TypeScript (noEmit)
- `pnpm test` / `pnpm test:watch` : Vitest
- `pnpm db:generate` / `pnpm db:migrate` / `pnpm db:studio` : Drizzle Kit

# Endpoints

- `GET /health` -> statut du serveur
- `POST /api/auth/register` -> inscription + JWT
- `POST /api/auth/login` -> connexion + JWT
- `GET /api/auth/me` -> infos user (JWT Bearer)
- `GET /api/omdb/search?s=batman&page=1` -> proxy OMDb (recherche)
- `GET /api/omdb/movie/:imdbId` -> proxy OMDb (détails)
- `GET /openapi.json` -> spec OpenAPI
- `GET /docs` -> Swagger UI

## 🔌 Socket.io (temps réel)

Auth socket: `socket.handshake.auth.token` (JWT).

Évènements:

- `room:join` (roomId)
- `message:send` ({ roomId, content }) -> persist en BDD -> broadcast `message:new`

## Architecture (fichiers)

- Entrée serveur: `/Users/ouchenedihya/Desktop/les projet 2 éme /CineConnect/apps/serveur/src/index.ts`
- App Express: `/Users/ouchenedihya/Desktop/les projet 2 éme /CineConnect/apps/serveur/src/app.ts`
- Env + validation (Zod): `/Users/ouchenedihya/Desktop/les projet 2 éme /CineConnect/apps/serveur/src/config/env.ts`
- DB (Drizzle): `/Users/ouchenedihya/Desktop/les projet 2 éme /CineConnect/apps/serveur/src/db/client.ts`
- Schémas (tables): `/Users/ouchenedihya/Desktop/les projet 2 éme /CineConnect/apps/serveur/src/db/schema/index.ts`
- Auth (JWT): `/Users/ouchenedihya/Desktop/les projet 2 éme /CineConnect/apps/serveur/src/routes/auth.ts`
- Proxy OMDb: `/Users/ouchenedihya/Desktop/les projet 2 éme /CineConnect/apps/serveur/src/routes/omdb.ts`
- Socket.io: `/Users/ouchenedihya/Desktop/les projet 2 éme /CineConnect/apps/serveur/src/socket/index.ts`
- OpenAPI: `/Users/ouchenedihya/Desktop/les projet 2 éme /CineConnect/apps/serveur/src/openapi/spec.ts`

## Notes de test dans ce sandbox

Dans ce sandbox Codex, l’ouverture d’un port peut échouer (`EPERM`). Pour valider que le serveur “démarre” sans écouter réseau:

```bash
NO_LISTEN=1 pnpm dev
```

Le serveur est prêt à être configuré avec votre stack backend préférée (Express, Fastify, NestJS, etc.).
