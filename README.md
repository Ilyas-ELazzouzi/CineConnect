# CineConnect - Lancement avec Docker

Ce projet peut etre lance avec un seul `docker compose up` (serveur + client + PostgreSQL).

## Prerequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installe

## Demarrage rapide

1. Clone le repo
2. A la racine du projet, lance:

```bash
docker compose up --build
```

3. Ouvre l'application:
   - App: `http://localhost:3001`
   - Swagger: `http://localhost:3001/docs`

Le client est servi par le serveur Express en mode production.

## Variables d'environnement

Le `docker-compose.yml` fournit des valeurs par defaut.  
Pour personnaliser les secrets et la cle OMDb, cree un fichier `.env` a la racine du repo (non versionne), par exemple:

```env
JWT_SECRET=your-super-secret-key
REFRESH_TOKEN_SECRET=your-super-refresh-secret
OMDB_API_KEY=your-omdb-key
```

Un exemple dedie Docker est disponible ici: `apps/serveur/.env.docker.example`.

## Arret

```bash
docker compose down
```

Pour supprimer aussi les donnees PostgreSQL:

```bash
docker compose down -v
```
