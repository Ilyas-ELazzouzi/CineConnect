# Stack cible backend (CineConnect)

Ce document décrit la stack “attendue” pour le backend, et comment faire évoluer le serveur actuel vers cette stack.

## Objectifs

- Exposer une API REST propre (Express)
- Persistences des données (PostgreSQL + Drizzle ORM)
- Authentification + autorisation (JWT)
- Temps réel pour la discussion (Socket.io)
- Documentation API (Swagger/OpenAPI)
- Tests (Jest ou Vitest)

## Proposition de structure (dossier `apps/serveur`)

```
apps/serveur/
  src/
    index.ts               # bootstrap HTTP + socket.io
    app.ts                 # express app
    config/
      env.ts               # validation + config
      cors.ts
    db/
      client.ts            # drizzle + pool pg
      schema/
        users.ts
        films.ts
        categories.ts
        reviews.ts
        messages.ts
        friends.ts
      migrations/
    modules/
      auth/
        routes.ts
        service.ts
        jwt.ts
      films/
        routes.ts
        service.ts
      reviews/
        routes.ts
      messages/
        routes.ts
        socket.ts
    middlewares/
      auth.ts              # vérif JWT
      error.ts             # error handler
      rateLimit.ts
    openapi/
      spec.ts              # génération/assemblage OpenAPI
  tests/
  drizzle.config.ts
  vitest.config.ts (ou jest.config.*)
```

## BDD PostgreSQL (tables suggérées)

### `users`
- `id` (uuid, pk)
- `username` (unique)
- `email` (unique)
- `password_hash`
- `avatar_url` (nullable)
- `created_at`, `updated_at`

### `films`
- `id` (uuid, pk) ou `imdb_id` (unique) si tu relies OMDb
- `title`, `year`, `poster_url`, `plot`, `director`, `runtime`, `imdb_rating`
- `created_at`, `updated_at`

### `categories`
- `id` (uuid, pk)
- `name` (unique)

### `reviews`
- `id` (uuid, pk)
- `user_id` (fk users)
- `film_id` (fk films)
- `rating` (1..5)
- `comment` (text)
- `created_at`

### `messages`
- `id` (uuid, pk)
- `user_id` (fk users)
- `room_id` (string/uuid)
- `content` (text)
- `created_at`

### `friends`
- `id` (uuid, pk)
- `user_id` (fk users)
- `friend_id` (fk users)
- `status` (pending/accepted/blocked)
- `created_at`

## Auth JWT (recommandations)

- Stocker `password_hash` (bcrypt/argon2)
- JWT court (`accessToken`) + refresh token (optionnel)
- Éviter `localStorage` côté client si possible: cookie `HttpOnly` + CSRF stratégie
- Middleware Express `requireAuth` qui vérifie le token et injecte `req.user`

## Socket.io (discussion temps réel)

Fonctionnement typique:

- Auth socket via token (handshake)
- Rooms: `room:<id>` (ex: `general`, `film:<imdbId>`)
- Events:
  - `message:send` -> persist `messages` -> broadcast `message:new`
  - `typing:start/stop`

## Swagger / OpenAPI

Deux options:

1) OpenAPI “à la main” (JSON/TS) + `swagger-ui-express`
2) Génération via decorators (Nest) ou via zod-to-openapi si tu utilises Zod

Minimum:

- `GET /docs` -> Swagger UI
- `GET /openapi.json` -> spec

## Tests (Jest ou Vitest)

Minimum utile:

- tests unitaires services (auth, films)
- tests d’intégration routes Express (supertest)
- tests socket.io (optionnel au début)

## Étapes de migration depuis l’implémentation actuelle

Le serveur actuel est en HTTP natif (sans dépendances) et sert de base.

1) Ajouter Express + structure `src/app.ts`
2) Ajouter PostgreSQL + Drizzle (schema + migrations)
3) Implémenter Auth (register/login/me)
4) Remplacer le proxy OMDb frontend par un endpoint backend (déjà amorcé)
5) Ajouter Socket.io + persistance des messages
6) Ajouter Swagger
7) Ajouter tests + CI

