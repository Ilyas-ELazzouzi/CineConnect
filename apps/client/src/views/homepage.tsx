// Vue de la page d'accueil
// Affiche le hero avec un film en vedette

import { useEffect } from 'react';
import { Hero } from '../components';
import { useFilmsStore } from '../stores/filmsStore';

export const HomePageView = () => {
  const { heroFilm, fetchHeroFilm, isLoading } = useFilmsStore();

  useEffect(() => {
    fetchHeroFilm();
  }, [fetchHeroFilm]);

  return (
    <div className="min-h-screen">
      <Hero film={heroFilm} isLoading={isLoading} />
    </div>
  );
};
