import { useState, useEffect, useCallback } from 'react';
import { Loading } from '../components';
import { useFilmsStore, useAuthStore } from '../hooks';
import { cleanPosterUrl } from '../lib/imageUtils';
import { fetchFilmComments, createFilmComment, type FilmComment } from '../lib/filmComments';

interface FilmDetailViewProps {
  filmId: string;
}

export const FilmDetailView: React.FC<FilmDetailViewProps> = ({ filmId }) => {
  const { getFilmById, isLoading } = useFilmsStore();
  const { token, isAuthenticated } = useAuthStore();
  const [film, setFilm] = useState<any>(null);
  const [imageError, setImageError] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [comments, setComments] = useState<FilmComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const loadComments = useCallback(async (imdbId: string) => {
    setCommentsLoading(true);
    try {
      const list = await fetchFilmComments(imdbId);
      setComments(list);
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadFilm = async () => {
      const filmData = await getFilmById(filmId);
      setFilm(filmData);
      if (filmData?.poster) {
        const cleaned = cleanPosterUrl(filmData.poster);
        setPosterUrl(cleaned);
      }
      if (filmData?.id) loadComments(filmData.id);
    };
    loadFilm();
  }, [filmId, loadComments]);

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
            Commentaires
          </h2>
          {isAuthenticated && token && (
            <form
              className="mb-6"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!film?.id || !commentText.trim() || !token) return;
                setCommentError(null);
                setCommentSubmitting(true);
                try {
                  const newComment = await createFilmComment(film.id, commentText.trim(), token);
                  setComments((prev) => [newComment, ...prev]);
                  setCommentText('');
                } catch (err) {
                  setCommentError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
                } finally {
                  setCommentSubmitting(false);
                }
              }}
            >
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Écrivez un commentaire..."
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 placeholder-gray-500 focus:border-[#9747FF] focus:ring-1 focus:ring-[#9747FF] resize-none"
                rows={3}
                maxLength={2000}
                disabled={commentSubmitting}
              />
              {commentError && (
                <p className="mt-2 text-sm text-red-400">{commentError}</p>
              )}
              <button
                type="submit"
                disabled={commentSubmitting || !commentText.trim()}
                className="mt-2 px-4 py-2 bg-[#9747FF] text-white font-medium rounded-lg hover:bg-[#7B2FCC] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {commentSubmitting ? 'Envoi...' : 'Publier'}
              </button>
            </form>
          )}
          {!isAuthenticated && (
            <p className="text-gray-400 mb-4">Connectez-vous pour laisser un commentaire.</p>
          )}
          {commentsLoading ? (
            <p className="text-gray-400">Chargement des commentaires...</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-500">Aucun commentaire pour le moment.</p>
          ) : (
            <ul className="space-y-4">
              {comments.map((c) => (
                <li key={c.id} className="border-b border-gray-800 pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[#9747FF]">
                      {c.author?.username ?? 'Utilisateur'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">{c.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
