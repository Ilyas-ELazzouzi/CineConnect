import { useState, useEffect, useCallback } from "react";
import { CollectionFilmCard, Loading } from "../components";
import { SearchIcon, FilterIcon } from "../components/icons";
import { useFilmsStore } from "../store";

export const FilmsView = () => {
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

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        setSearchQuery(localSearchQuery);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearchQuery, searchQuery, setSearchQuery]);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchFilms(searchQuery);
    } else if (selectedCategory) {
      fetchFilmsByCategory(selectedCategory, 50);
    } else {
      fetchPopularFilms(50);
    }
  }, [searchQuery, selectedCategory]);

  const toggleGenre = useCallback(
    (genre: string) => {
      setSelectedGenres((prev) => {
        if (prev.includes(genre)) {
          return prev.filter((g) => g !== genre);
        }
        return [...prev, genre];
      });
      setSelectedCategory("");
    },
    [setSelectedCategory]
  );

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
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-3">
            EXPLOREZ NOTRE COLLECTION
          </h1>
          <p className="text-gray-400 text-lg md:text-xl">
            Des milliers de films à découvrir
          </p>
        </div>

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
