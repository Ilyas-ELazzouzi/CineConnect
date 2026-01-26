// Route racine de l'application
// Définit le layout principal avec Header et Outlet pour les routes enfants

import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Header } from '../components';

export const Route = createRootRoute({
  component: () => {
    return (
      <div className="min-h-screen bg-black">
        {/* Header fixe en haut de toutes les pages */}
        <Header />
        {/* Contenu des routes enfants (pages) */}
        <main>
          <Outlet />
        </main>
      </div>
    );
  },
});
