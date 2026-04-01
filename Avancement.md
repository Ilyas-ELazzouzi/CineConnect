# Avancement du projet CineConnect

Document de suivi à jour des réalisations du projet, de façon synthétique.

---

## Vue d’ensemble




**CineConnect** est un monorepo (pnpm) contenant une application web de type « cinéma / films » : un **client** React (Vite) et un **serveur** Node (Express) qui s’appuie sur une base PostgreSQL et l’API OMDb pour les données films.

---

## Structure du projet

- **`apps/client`** : frontend React (Vite, TanStack Router, Zustand).
- **`apps/serveur`** : backend Express, base de données (Drizzle + PostgreSQL), Socket.IO.
- Scripts racine : `dev`, `dev:client`, `dev:server`, `build`, `build:client`, `build:server`, `start`, `lint`, etc.

---

## Backend (serveur)

- **API REST** : routes health, authentification (inscription, connexion, profil), proxy OMDb (recherche et détail film).
- **Authentification** : JWT (Bearer), hash des mots de passe (bcrypt). Middleware `requireAuth` pour protéger les routes.
- **Base de données** : PostgreSQL avec Drizzle ORM. Schéma défini (users, films, categories, reviews, messages, friends) et migrations gérées.
- **Logique métier** : séparation routes / services (authService, omdbService). Validation des entrées (Zod) et gestion d’erreurs centralisée.
- **Configuration** : variables d’environnement validées au démarrage (Zod). CORS configuré selon les origines autorisées.
- **Temps réel** : Socket.IO attaché au même serveur HTTP ; authentification par JWT ; rooms et envoi de messages persistés en base (table `messages`).
- **Documentation API** : OpenAPI / Swagger exposé (`/docs`, `/openapi.json`).
- **Script de test** : script manuel pour tester les sockets sans front (login puis connexion socket, envoi de message).

---

## Frontend (client)

- **Stack** : React, Vite, TypeScript, TanStack Router, React Query, Zustand, Tailwind.
- **Pages / vues** : accueil (hero + tendances), collection films (recherche, filtres par genre), détail film, connexion / inscription, profil, discussion (placeholder).
- **État** : stores Zustand pour l’auth, les films (liste, hero, catégories, recherche) et l’UI (modales, menu, thème).
- **API** : appels au serveur pour l’auth et au proxy OMDb pour les films (recherche, détail, films populaires, par catégorie). Pas de stockage d’images en base ni bucket ; uniquement des URLs (ex. posters OMDb).
- **UI** : composants réutilisables (Hero, cartes film, boutons, header, loading). Style type « cinéma » (fond sombre, accents violet).

---

## Base de données

- **Tables** : users, films, categories, reviews, messages, friends.
- **Relations** : User 1–N Reviews, Film 1–N Reviews ; User 1–N Messages ; User N–N User (amis) via la table `friends` avec statut (pending, accepted, rejected). Aucune liaison films–categories en base pour l’instant.
- **Outils** : Drizzle pour le schéma et les requêtes ; migrations et Drizzle Kit (generate, migrate, studio) disponibles.

---

## Qualité et bonnes pratiques

- **Refacto** : logique métier extraite des routes vers des services (auth, OMDb).
- **Validation** : Zod pour la config serveur et les payloads des routes (auth). Erreurs de validation renvoyées en JSON structuré (400).
- **Client** : commentaires retirés du code source pour garder un code plus épuré.
- **Tests** : Vitest côté serveur ; script manuel `test:socket` pour tester les sockets.

---

## Dépendances externes

- **OMDb** : API externe pour les données films (recherche, détails, posters). La clé API est côté serveur ; le client passe par le proxy du backend.
- **PostgreSQL** : hébergement des données (utilisateurs, avis, messages, amis, etc.). Connexion via `DATABASE_URL` dans le `.env` du serveur.

---

