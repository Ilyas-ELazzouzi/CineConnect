// Vue HomeView : Page d'accueil principale
// Affiche le hero avec un film en vedette et la section "Tendances du moment"

import { useEffect } from "react";
import { Hero, TrendingSection } from "../components";
import { useFilmsStore } from "../store";

export const HomeView = () => {
  // Récupération des données et actions depuis le store films
  const {
    heroFilm,
    isLoading,
    fetchHeroFilm,
    fetchPopularFilms,
    fetchCategories,
  } = useFilmsStore();

  // Charger les données au montage du composant
  useEffect(() => {
    fetchHeroFilm(); // Récupérer un film aléatoire pour le hero
    fetchPopularFilms(20); // Récupérer 20 films populaires pour la section tendances
    fetchCategories(); // Récupérer la liste des catégories
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Section Hero avec film en vedette */}
      <Hero film={heroFilm} isLoading={isLoading && !heroFilm} />

      {/* Contenu principal avec padding pour compenser le header fixe */}
      <div className="pt-16 overflow-x-hidden" style={{ overflowY: "visible" }}>
        {/* Section "Tendances du moment" avec grille horizontale scrollable */}
        <TrendingSection />
      </div>
    </div>
  );
};
