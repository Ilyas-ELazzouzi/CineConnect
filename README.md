# CineConnect - Monorepo

Un monorepo moderne utilisant pnpm pour gérer le frontend et le backend de l'application CineConnect.

## 📁 Structure du projet

```
CineConnect/
├── apps/
│   ├── client/          # Application React frontend
│   └── serveur/         # Application backend (à venir)
├── packages/            # Packages partagés (à venir)
├── pnpm-workspace.yaml  # Configuration du workspace pnpm
├── package.json         # Configuration racine du monorepo
└── .npmrc              # Configuration pnpm
```

## 🚀 Prérequis

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## 📦 Installation

```bash
# Installer pnpm globalement (si pas déjà installé)
npm install -g pnpm

# Installer toutes les dépendances du monorepo
pnpm install
```

## 🛠️ Scripts disponibles

### Depuis la racine :

```bash
# Démarrer le client en mode développement
pnpm dev
# ou
pnpm dev:client

# Démarrer le serveur en mode développement
pnpm dev:server

# Build du client
pnpm build
# ou
pnpm build:client

# Build du serveur
pnpm build:server

# Linter le client
pnpm lint

# Nettoyer tous les node_modules
pnpm clean
```

### Depuis un package spécifique :

```bash
# Aller dans le dossier du package
cd apps/client

# Exécuter les scripts du package
pnpm dev
pnpm build
pnpm lint
```

## 📚 Technologies utilisées

### Client
- React 19
- TypeScript
- Vite
- TanStack Router
- TanStack Query
- Tailwind CSS
- shadcn/ui

### Serveur
- À définir

## 🔧 Configuration

Le monorepo utilise pnpm workspaces pour gérer les dépendances. Les packages sont définis dans `pnpm-workspace.yaml`.

## 📝 Développement

1. Cloner le repository
2. Installer les dépendances : `pnpm install`
3. Démarrer le client : `pnpm dev`
4. Démarrer le serveur : `pnpm dev:server` (quand disponible)

## 🏗️ Architecture

- **apps/client** : Application frontend React avec Vite
- **apps/serveur** : Application backend (à implémenter)
- **packages/** : Packages partagés entre les apps (à venir)
