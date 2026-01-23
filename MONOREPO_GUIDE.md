# Guide du Monorepo CineConnect

## 📋 Ce qui a été fait

### 1. Structure du Monorepo

Le projet a été transformé en monorepo utilisant **pnpm workspaces**. Voici la nouvelle structure :

```
CineConnect/
├── apps/
│   ├── client/          # Application React frontend
│   │   ├── src/
│   │   ├── package.json
│   │   └── ...
│   └── serveur/         # Application backend
│       ├── package.json
│       └── ...
├── packages/            # Packages partagés (pour le futur)
├── pnpm-workspace.yaml  # Configuration des workspaces
├── package.json         # Configuration racine
├── .npmrc              # Configuration pnpm
└── .gitignore          # Fichiers à ignorer
```

### 2. Fichiers créés/modifiés

#### À la racine :
- **`pnpm-workspace.yaml`** : Définit les packages du monorepo (apps/* et packages/*)
- **`package.json`** : Configuration racine avec scripts pour gérer tous les packages
- **`.npmrc`** : Configuration pnpm (hoisting, peer dependencies)
- **`.gitignore`** : Fichiers à ignorer dans Git
- **`README.md`** : Documentation principale du projet

#### Dans apps/client :
- **`package.json`** : Nom changé de "frontend" à "@cineconnect/client" pour le monorepo
- Tous les autres fichiers conservés

#### Dans apps/serveur :
- **`package.json`** : Créé avec la structure de base
- **`README.md`** : Documentation du serveur

### 3. Avantages du Monorepo

✅ **Gestion centralisée** : Toutes les dépendances au même endroit
✅ **Partage de code** : Facile de partager du code entre client et serveur
✅ **Scripts unifiés** : Commandes depuis la racine pour tous les packages
✅ **Versioning cohérent** : Tous les packages utilisent les mêmes versions
✅ **Installation rapide** : pnpm est plus rapide que npm/yarn

### 4. Configuration pnpm

Le fichier `.npmrc` contient :
- `shamefully-hoist=true` : Monte les dépendances à la racine (compatibilité)
- `strict-peer-dependencies=false` : Plus flexible avec les peer dependencies
- `auto-install-peers=true` : Installe automatiquement les peer dependencies

## 🚀 Utilisation

### Installation initiale

```bash
# Installer pnpm globalement
npm install -g pnpm

# Installer toutes les dépendances
pnpm install
```

### Commandes principales

```bash
# Démarrer le client
pnpm dev
# ou
pnpm --filter client dev

# Démarrer le serveur (quand implémenté)
pnpm dev:server

# Build du client
pnpm build:client

# Linter
pnpm lint
```

### Travailler sur un package spécifique

```bash
# Aller dans le dossier
cd apps/client

# Utiliser pnpm normalement
pnpm dev
pnpm add <package>
```

## 🔄 Migration depuis l'ancienne structure

1. ✅ Structure créée : `apps/client` et `apps/serveur`
2. ✅ Fichiers copiés : Tous les fichiers du client ont été copiés
3. ✅ Configuration mise à jour : `package.json` du client renommé
4. ⚠️ **À faire manuellement** :
   - Supprimer l'ancien dossier `client` à la racine (si encore présent)
   - Supprimer les `node_modules` et `package-lock.json` de l'ancien client
   - Exécuter `pnpm install` à la racine

## 📦 Gestion des dépendances

### Ajouter une dépendance au client

```bash
# Depuis la racine
pnpm --filter @cineconnect/client add <package>

# Depuis apps/client
cd apps/client
pnpm add <package>
```

### Ajouter une dépendance au serveur

```bash
# Depuis la racine
pnpm --filter @cineconnect/serveur add <package>

# Depuis apps/serveur
cd apps/serveur
pnpm add <package>
```

### Ajouter une dépendance partagée (futur)

Quand vous créerez des packages partagés dans `packages/`, vous pourrez les utiliser ainsi :

```bash
# Dans apps/client/package.json
{
  "dependencies": {
    "@cineconnect/shared": "workspace:*"
  }
}
```

## 🎯 Prochaines étapes

1. **Nettoyer l'ancienne structure** : Supprimer l'ancien dossier `client` si présent
2. **Installer les dépendances** : `pnpm install` à la racine
3. **Tester le client** : `pnpm dev` pour vérifier que tout fonctionne
4. **Configurer le serveur** : Ajouter votre stack backend dans `apps/serveur`
5. **Créer des packages partagés** : Types, utilitaires, etc. dans `packages/`

## ⚠️ Notes importantes

- Les `node_modules` sont maintenant à la racine (hoisting)
- Utilisez toujours `pnpm` et non `npm` ou `yarn`
- Les imports relatifs dans le client restent inchangés
- Les alias `@/` dans le client fonctionnent toujours

## 🐛 Dépannage

### Problème : "Cannot find module"
```bash
# Réinstaller les dépendances
pnpm install
```

### Problème : "Workspace not found"
Vérifiez que `pnpm-workspace.yaml` contient bien `apps/*`

### Problème : Scripts ne fonctionnent pas
Vérifiez que vous êtes à la racine du monorepo et utilisez `pnpm` (pas `npm`)
