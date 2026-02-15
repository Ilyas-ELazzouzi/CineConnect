// Composant Hero : Section hero de la page d'accueil
// Affiche un film en vedette avec image de fond en plein écran
// Style inspiré de Netflix avec overlay et informations du film

import { StarIcon, CalendarIcon } from "./icons";
import type { Film } from "../lib/api";
import { cleanPosterUrl } from "../lib/imageUtils";
import { useState, useEffect } from "react";
import { ButtonLink } from "./ButtonLink";

interface HeroProps {
  film: Film | null; // Film à afficher en vedette
  isLoading?: boolean; // Indicateur de chargement
}

export const Hero: React.FC<HeroProps> = ({ film, isLoading = false }) => {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Nettoyer l'URL du poster et la définir comme image de fond
  useEffect(() => {
    if (film?.poster) {
      const cleaned = cleanPosterUrl(film.poster);
      setBackgroundImage(cleaned);
      setImageError(false);
    }
  }, [film]);

  // Afficher un état de chargement si le film n'est pas encore chargé
  if (isLoading || !film) {
    return (
      <div className="relative h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="animate-pulse text-white text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Image de fond avec overlays pour la lisibilité */}
      <div className="absolute inset-0">
        {backgroundImage && !imageError ? (
          <>
            <img
              src={backgroundImage}
              alt={film.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            {/* Overlay gradient de gauche pour améliorer la lisibilité du texte */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
            {/* Overlay gradient du bas pour le contenu */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </>
        ) : (
          // Fallback si l'image ne charge pas
          <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-900" />
        )}
      </div>

      {/* Contenu principal avec informations du film */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="max-w-2xl space-y-6 animate-fade-in">
            {/* Titre du film en très grand */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-black text-white leading-tight">
              {film.title.toUpperCase()}
            </h1>

            {/* Métadonnées : note, année, durée */}
            <div className="flex items-center space-x-6 text-white">
              {film.rating && (
                <div className="flex items-center space-x-2">
                  <StarIcon className="w-6 h-6 text-yellow-400" />
                  <span className="text-xl font-semibold">
                    {Number(film.rating).toFixed(1)}
                  </span>
                </div>
              )}
              {film.year && (
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-6 h-6" />
                  <span className="text-xl font-semibold">{film.year}</span>
                </div>
              )}
              {film.runtime && (
                <div className="text-xl font-semibold">{film.runtime}</div>
              )}
            </div>

            {/* Description du film */}
            {film.plot && (
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl line-clamp-3">
                {film.plot}
              </p>
            )}

            {/* Boutons d'action */}
            <div className="flex items-center space-x-4 pt-4">
              <ButtonLink
                to={`/film/${film.id}`}
                variant="primary"
                size="lg"
                className="transform hover:scale-105"
              >
                Notez !
              </ButtonLink>
              <ButtonLink to={`/film/${film.id}`} variant="secondary" size="lg">
                Plus d'infos
              </ButtonLink>
            </div>

            {/* Tags de catégories */}
            {film.categories && film.categories.length > 0 && (
              <div className="flex items-center space-x-2 pt-2">
                {film.categories.slice(0, 3).map((category, index) => (
                  <span
                    key={index}
                    className="px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/20 capitalize"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
