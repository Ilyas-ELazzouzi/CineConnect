// Point d'entrée principal de l'application React
// Configure le router et le client de requêtes avant de rendre l'application

import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routeTree } from './routeTree.gen';
import './index.css';

// Configuration du client React Query pour gérer le cache et les requêtes
// Désactive le refetch automatique au focus de la fenêtre pour éviter les requêtes inutiles
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1, // Ne réessayer qu'une seule fois en cas d'erreur
    },
  },
});

// Création du router avec l'arbre de routes généré automatiquement
const router = createRouter({ routeTree });

// Déclaration TypeScript pour que le router soit reconnu par TanStack Router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Rendu de l'application dans le DOM
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
