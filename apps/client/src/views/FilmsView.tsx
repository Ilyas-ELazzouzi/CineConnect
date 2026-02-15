// Vue FilmsView : Page de collection de tous les films
// Permet de rechercher, filtrer et parcourir tous les films disponibles

import { useState, useEffect, useCallback } from "react";
import { CollectionFilmCard, Loading } from "../components";
import { SearchIcon, FilterIcon } from "../components/icons";
import { useFilmsStore } from "../store";

export const FilmsView = () => {
  // Récupération des données et actions depuis le store films
  const {
    films,
    searchQuery,
    selectedCategory,
    isLoading,
    setSearchQuery,
    setSelectedCategory,
    fetchPopularFilms,
    searchFilms,
    fetchFilmsByCategory,
    fetchCategories,
  } = useFilmsStore();

  // État local pour la recherche (avec debounce)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  // Genres sélectionnés pour le filtrage
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  // Affichage des filtres avancés (non utilisé pour l'instant)
  const [showFilters, setShowFilters] = useState(false);

  // Charger les catégories disponibles au montage
  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce de la recherche : attendre 500ms après la dernière frappe
  // Évite de faire trop de requêtes API
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        setSearchQuery(localSearchQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchQuery, searchQuery, setSearchQuery]);

  // Charger les films selon la recherche ou la catégorie sélectionnée
  useEffect(() => {
    if (searchQuery.trim()) {
      // Si recherche active, lancer la recherche
      searchFilms(searchQuery);
    } else if (selectedCategory) {
      // Si catégorie sélectionnée, charger les films de cette catégorie
      fetchFilmsByCategory(selectedCategory, 50);
    } else {
      // Sinon, charger les films populaires
      fetchPopularFilms(50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory]);

  // Toggle un genre dans la liste des genres sélectionnés
  const toggleGenre = useCallback(
    (genre: string) => {
      setSelectedGenres((prev) => {
        if (prev.includes(genre)) {
          // Retirer le genre s'il est déjà sélectionné
          return prev.filter((g) => g !== genre);
        }
        // Ajouter le genre s'il n'est pas sélectionné
        return [...prev, genre];
      });
      // Réinitialiser la catégorie sélectionnée quand on utilise les filtres de genre
      setSelectedCategory("");
    },
    [setSelectedCategory]
  );

  // Filtrer les films selon les genres sélectionnés
  // Si aucun genre n'est sélectionné, afficher tous les films
  const filteredFilms =
    selectedGenres.length > 0
      ? films.filter((film) =>
          film.categories?.some((cat) =>
            selectedGenres.some((genre) =>
              cat.toLowerCase().includes(genre.toLowerCase())
            )
          )
        )
      : films;

  // Liste des genres populaires pour les badges de filtrage
  const popularGenres = [
    "Action",
    "Thriller",
    "Horror",
    "Sci-Fi",
    "Fantasy",
    "Romance",
    "Anime",
    "Comedy",
    "Drama",
    "Adventure",
  ];

  return (
    <div className="min-h-screen bg-black pt-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* En-tête avec titre et sous-titre centrés */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-3">
            EXPLOREZ NOTRE COLLECTION
          </h1>
          <p className="text-gray-400 text-lg md:text-xl">
            Des milliers de films à découvrir
          </p>
        </div>

        {/* Barre de recherche avec icône et bouton filtres */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Rechercher un film, un acteur..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#9747FF] focus:border-transparent transition-all"
            />
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 bg-[#9747FF] hover:bg-[#8a3ae6] text-white font-semibold rounded-lg transition-all duration-300 flex items-center gap-2"
          >
            <FilterIcon className="w-5 h-5" />
            Filtres
          </button>
        </div>

        {/* Badges de filtrage par genre */}
        <div className="mb-8 flex flex-wrap gap-3">
          {popularGenres.map((genre) => {
            const isSelected = selectedGenres.includes(genre);
            return (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                  ${
                    isSelected
                      ? "bg-[#9747FF] text-white"
                      : "bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800"
                  }
                `}
              >
                {genre}
              </button>
            );
          })}
        </div>

        {/* Grille de films responsive */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loading text="Chargement des films..." />
          </div>
        ) : filteredFilms.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">Aucun film trouvé</div>
            <p className="text-gray-500 mt-2">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
            {filteredFilms.map((film) => (
              <CollectionFilmCard key={film.id} film={film} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
