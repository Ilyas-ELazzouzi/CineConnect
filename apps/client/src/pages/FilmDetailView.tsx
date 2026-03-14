import { useState, useEffect } from 'react';
import { Loading } from '../components';
import { useFilmsStore } from '../hooks';
import { cleanPosterUrl } from '../lib/imageUtils';

interface FilmDetailViewProps {
  filmId: string;
}

export const FilmDetailView: React.FC<FilmDetailViewProps> = ({ filmId }) => {
  const { getFilmById, isLoading } = useFilmsStore();
  const [film, setFilm] = useState<any>(null);
  const [imageError, setImageError] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadFilm = async () => {
      const filmData = await getFilmById(filmId);
      setFilm(filmData);
      if (filmData?.poster) {
        const cleaned = cleanPosterUrl(filmData.poster);
        setPosterUrl(cleaned);
      }
    };
    loadFilm();
  }, [filmId]);

  if (isLoading || !film) {
    return (
      <div className="min-h-screen bg-black pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Loading text="Chargement..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-1">
            {posterUrl && !imageError ? (
              <img
                src={posterUrl}
                alt={film.title}
                className="w-full rounded-lg shadow-lg"
                onError={(e) => {
                  e.preventDefault();
                  setImageError(true);
                }}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-[500px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg flex items-center justify-center">
                <div className="text-center p-8">
                  <svg className="w-24 h-24 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-500 text-lg">{film.title}</span>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <h1 className="text-4xl font-display font-bold text-white mb-4">
              {film.title}
            </h1>

            {film.year && (
              <p className="text-xl text-gray-400 mb-2">{film.year}</p>
            )}

            {film.director && (
              <p className="text-lg text-gray-400 mb-4">
                Réalisateur: {film.director}
              </p>
            )}

            {film.rating && (
              <div className="flex items-center mb-4">
                <span className="text-yellow-500 text-2xl">★</span>
                <span className="ml-2 text-xl text-gray-300">
                  {Number(film.rating).toFixed(1)} / 5.0
                </span>
              </div>
            )}

            {film.plot && (
              <p className="text-gray-300 mb-4">{film.plot}</p>
            )}

            {film.categories && film.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {film.categories.map((cat: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[#9747FF]/20 text-[#9747FF] rounded-full text-sm capitalize border border-[#9747FF]/30"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}

            {film.actors && (
              <p className="text-gray-400 mb-2">
                <span className="font-semibold">Acteurs:</span> {film.actors}
              </p>
            )}

            {film.runtime && (
              <p className="text-gray-400 mb-2">
                <span className="font-semibold">Durée:</span> {film.runtime}
              </p>
            )}

            {film.imdbRating && (
              <p className="text-gray-400 mb-2">
                <span className="font-semibold">Note IMDb:</span> {film.imdbRating} / 10
              </p>
            )}
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg shadow">
          <h2 className="text-2xl font-display font-semibold text-white mb-4">
            Informations supplémentaires
          </h2>
          <p className="text-gray-400">
            En Phase 1, les fonctionnalités de notation et de commentaires seront disponibles après l'intégration du backend.
          </p>
        </div>
      </div>
    </div>
  );
};
