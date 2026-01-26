// Composant FilmCard : Carte de film réutilisable
// Supporte deux variantes : default (pour la page d'accueil) et compact (pour les listes)

import { Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { cleanPosterUrl } from '../lib/imageUtils';
import { Film } from '../lib/api';

interface FilmCardProps {
  film: Film; // Film à afficher
  variant?: 'default' | 'compact'; // Variante d'affichage
}

export const FilmCard: React.FC<FilmCardProps> = ({ film, variant = 'default' }) => {
  const [imageError, setImageError] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  // Nettoyer l'URL du poster
  useEffect(() => {
    const cleaned = cleanPosterUrl(film.poster);
    setPosterUrl(cleaned);
  }, [film.poster]);

  // Gérer les erreurs de chargement d'image
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.preventDefault();
    setImageError(true);
  };

  // Variante compacte : design minimaliste pour les listes
  if (variant === 'compact') {
    return (
      <Link
        to="/film/$id"
        params={{ id: film.id }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden"
      >
        {posterUrl && !imageError ? (
          <img
            src={posterUrl}
            alt={film.title}
            className="w-full h-64 object-cover"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
            <div className="text-center p-4">
              <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-500 dark:text-gray-400 text-xs">{film.title}</span>
            </div>
          </div>
        )}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
            {film.title}
          </h3>
          {film.year && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              {film.year}
            </p>
          )}
          {film.rating && (
            <div className="flex items-center">
              <span className="text-yellow-500">★</span>
              <span className="ml-1 text-gray-700 dark:text-gray-300">
                {Number(film.rating).toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </Link>
    );
  }

  // Variante par défaut : design avec effets au survol
  return (
    <Link
      to="/film/$id"
      params={{ id: film.id }}
      className="group relative bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-[#9747FF]/20"
    >
      <div className="aspect-[2/3] relative">
        {posterUrl && !imageError ? (
          <img
            src={posterUrl}
            alt={film.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          // Placeholder si l'image ne charge pas
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center p-4">
              <svg className="w-16 h-16 mx-auto text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-500 text-xs">{film.title}</span>
            </div>
          </div>
        )}
        {/* Overlay gradient qui apparaît au survol */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white mb-1 line-clamp-1 group-hover:text-[#a974ff] transition-colors">
          {film.title}
        </h3>
        {film.year && (
          <p className="text-gray-400 text-sm mb-2">{film.year}</p>
        )}
        {film.rating && (
          <div className="flex items-center space-x-1">
            <span className="text-yellow-400">★</span>
            <span className="text-gray-300 text-sm">
              {Number(film.rating).toFixed(1)}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};
