import { useEffect } from 'react';
import { FilmCard, Loading } from '../components';
import { useFilmsStore } from '../hooks';

interface FilmsByCategoryViewProps {
  category: string;
}

export const FilmsByCategoryView: React.FC<FilmsByCategoryViewProps> = ({ category }) => {
  const { films, isLoading, fetchFilmsByCategory } = useFilmsStore();

  useEffect(() => {
    fetchFilmsByCategory(category, 50);
  }, [category]);

  return (
    <div className="min-h-screen bg-black pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-display font-bold text-white mb-8 capitalize">
          Films - {category}
        </h1>

        {isLoading ? (
          <div className="text-center py-12">
            <Loading text="Chargement..." />
          </div>
        ) : films.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400">Aucun film trouvé dans cette catégorie</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {films.map((film) => (
              <FilmCard key={film.id} film={film} variant="compact" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
