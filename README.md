# CineConnect

Monorepo CineConnect avec:
- `apps/client` (React + Vite)
- `apps/serveur` (Node.js + Express + Drizzle)
- PostgreSQL (local ou Docker)

## Prerequis

- Node.js `>= 18`
- `pnpm` `>= 8`
- Docker Desktop (optionnel, pour le demarrage via containers)

---

## Lancer le projet en local (recommande pour le dev)

### 1) Installer les dependances

Depuis la racine:

```bash
pnpm install
```

### 2) Demarrer PostgreSQL

Option simple avec Docker (BDD uniquement):

```bash
docker compose up -d db
```

### 3) Configurer les variables d'environnement du serveur

Dans `apps/serveur`, creer un fichier `.env` (ou partir de `.env.example` si present) avec au minimum:

```env
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cineconnect
JWT_SECRET=change-me
REFRESH_TOKEN_SECRET=change-me-too
OMDB_API_KEY=your_omdb_key
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### 4) Appliquer les migrations BDD

```bash
pnpm --filter @cineconnect/serveur db:migrate
```

### 5) Lancer le serveur et le client

Dans deux terminaux differents:

```bash
pnpm dev:server
```

```bash
pnpm dev:client
```

### 6) URLs utiles

- Frontend: `http://localhost:5173`
- API backend: `http://localhost:3001`
- Swagger: `http://localhost:3001/docs`

---

## Lancer tout avec Docker

Depuis la racine:

```bash
docker compose up --build
```

Services exposes:
- App/API: `http://localhost:3001`
- Swagger: `http://localhost:3001/docs`
- PostgreSQL: `localhost:5432`

Le `docker-compose.yml` fournit des valeurs par defaut pour la plupart des variables.

---

## Scripts utiles (racine)

- `pnpm dev` : lance le client
- `pnpm dev:client` : lance le client (Vite)
- `pnpm dev:server` : lance le serveur (tsx watch)
- `pnpm build` : build client
- `pnpm build:server` : build serveur
- `pnpm lint` : lint client

---

## Arret des containers

```bash
docker compose down
```

Pour supprimer aussi les volumes PostgreSQL:

```bash
docker compose down -v
```
