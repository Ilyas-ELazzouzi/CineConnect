import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { cleanPosterUrl } from "../lib/imageUtils";
import type { Film } from "../lib/api";

interface CollectionFilmCardProps {
  film: Film;
}

export const CollectionFilmCard: React.FC<CollectionFilmCardProps> = ({
  film,
}) => {
  const [imageError, setImageError] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  useEffect(() => {
    const cleaned = cleanPosterUrl(film.poster);
    setPosterUrl(cleaned);
  }, [film.poster]);

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    e.preventDefault();
    setImageError(true);
  };

  return (
    <Link
      to="/film/$id"
      params={{ id: film.id }}
      className="group relative block transition-all duration-700 ease-out hover:scale-[1.08] hover:z-20 hover:translate-y-[-8px]"
    >
      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-xl bg-gray-900 group-hover:shadow-2xl group-hover:shadow-[#9747FF]/60 transition-all duration-700">
          <div className="aspect-[2/3] relative">
            {posterUrl && !imageError ? (
              <>
                <img
                  src={posterUrl}
                  alt={film.title}
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-115"
                  onError={handleImageError}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#9747FF] transition-all duration-700 rounded-xl group-hover:shadow-[0_0_20px_rgba(151,71,255,0.5)]" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_1.5s_ease-in-out] rounded-xl" />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {film.year && (
            <p className="text-gray-400 text-sm font-medium transition-colors group-hover:text-gray-300">
              {film.year}
            </p>
          )}

          <div className="flex items-start justify-between gap-2">
            <h3 className="text-white font-semibold text-base line-clamp-2 flex-1 group-hover:text-[#9747FF] transition-colors duration-300">
              {film.title}
            </h3>
            {film.rating && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-yellow-400 text-sm">★</span>
                <span className="text-white text-sm font-medium">
                  {Number(film.rating).toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {film.categories && film.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {film.categories.slice(0, 2).map((category, catIndex) => (
                <span
                  key={catIndex}
                  className="px-2.5 py-1 bg-[#9747FF]/10 text-[#9747FF] rounded-full text-xs font-medium border border-[#9747FF]/20 capitalize transition-all duration-500 group-hover:bg-[#9747FF]/25 group-hover:border-[#9747FF]/50 group-hover:scale-105 group-hover:shadow-[0_0_10px_rgba(151,71,255,0.3)]"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
