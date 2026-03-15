import { useState, useEffect, useCallback } from 'react';
import { Loading } from '../components';
import { useFilmsStore, useAuthStore } from '../hooks';
import { cleanPosterUrl } from '../lib/imageUtils';
import {
  fetchFilmComments,
  createFilmComment,
  setFilmCommentReaction,
  type FilmComment,
} from '../lib/filmComments';
import { fetchFilmRating, setFilmRating, type FilmRatingInfo } from '../lib/filmRatings';

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
  const [reactingCommentId, setReactingCommentId] = useState<string | null>(null);
  const [ratingInfo, setRatingInfo] = useState<FilmRatingInfo | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const loadComments = useCallback(async (imdbId: string, authToken?: string | null) => {
    setCommentsLoading(true);
    try {
      const list = await fetchFilmComments(imdbId, authToken);
      setComments(list);
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  const loadRating = useCallback(async (imdbId: string, authToken?: string | null) => {
    setRatingLoading(true);
    try {
      const info = await fetchFilmRating(imdbId, authToken);
      setRatingInfo(info);
    } catch {
      setRatingInfo(null);
    } finally {
      setRatingLoading(false);
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
      if (filmData?.id) {
        loadComments(filmData.id, token);
        loadRating(filmData.id, token);
      }
    };
    loadFilm();
  }, [filmId, loadComments, loadRating, token]);

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

            <div className="mb-4">
              <p className="text-gray-400 mb-1">Note de la communauté</p>
              {ratingLoading ? (
                <span className="text-gray-500">Chargement...</span>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 text-xl">
                      ★ {(ratingInfo?.averageRating ?? 0).toFixed(1)}
                    </span>
                    <span className="text-gray-500 text-sm">
                      / 5 · {(ratingInfo?.count ?? 0)} avis
                    </span>
                  </div>
                  {isAuthenticated && token && (
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          disabled={ratingSubmitting}
                          onClick={async () => {
                            if (!film?.id || !token) return;
                            setRatingSubmitting(true);
                            try {
                              const info = await setFilmRating(film.id, star, token);
                              setRatingInfo(info);
                            } finally {
                              setRatingSubmitting(false);
                            }
                          }}
                          className={`p-0.5 rounded transition disabled:opacity-50 ${
                            (ratingInfo?.userRating ?? 0) >= star
                              ? 'text-yellow-500'
                              : 'text-gray-600 hover:text-gray-400'
                          }`}
                          title={`Noter ${star}/5`}
                        >
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

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
                  setComments((prev) => [
                    {
                      ...newComment,
                      likeCount: 0,
                      dislikeCount: 0,
                      userReaction: null,
                    },
                    ...prev,
                  ]);
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
                  {isAuthenticated && token && (
                    <div className="flex items-center gap-4 mt-2">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!film?.id || !token) return;
                          setReactingCommentId(c.id);
                          try {
                            const result = await setFilmCommentReaction(
                              film.id,
                              c.id,
                              1,
                              token,
                            );
                            setComments((prev) =>
                              prev.map((x) =>
                                x.id === c.id
                                  ? {
                                      ...x,
                                      likeCount: result.likeCount,
                                      dislikeCount: result.dislikeCount,
                                      userReaction: result.userReaction,
                                    }
                                  : x,
                              ),
                            );
                          } finally {
                            setReactingCommentId(null);
                          }
                        }}
                        disabled={reactingCommentId === c.id}
                        className={`flex items-center gap-1 text-sm rounded px-2 py-1 transition ${
                          c.userReaction === 1
                            ? 'bg-[#9747FF]/30 text-[#9747FF]'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        } disabled:opacity-50`}
                        title="J'aime"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 000 2v3h3.56a1 1 0 01.962.726l1.2 6A1 1 0 0115.56 16H8.943a1 1 0 00-.447.106l-.05.025A1 1 0 018 13.763v-5.43a1 1 0 00-.657-.928l-2.382-.794A1 1 0 014 6.257v.676a1 1 0 001 1z" />
                        </svg>
                        <span>{c.likeCount ?? 0}</span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!film?.id || !token) return;
                          setReactingCommentId(c.id);
                          try {
                            const result = await setFilmCommentReaction(
                              film.id,
                              c.id,
                              -1,
                              token,
                            );
                            setComments((prev) =>
                              prev.map((x) =>
                                x.id === c.id
                                  ? {
                                      ...x,
                                      likeCount: result.likeCount,
                                      dislikeCount: result.dislikeCount,
                                      userReaction: result.userReaction,
                                    }
                                  : x,
                              ),
                            );
                          } finally {
                            setReactingCommentId(null);
                          }
                        }}
                        disabled={reactingCommentId === c.id}
                        className={`flex items-center gap-1 text-sm rounded px-2 py-1 transition ${
                          c.userReaction === -1
                            ? 'bg-red-500/30 text-red-400'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        } disabled:opacity-50`}
                        title="Je n'aime pas"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 000-2v-3H4.44a1 1 0 01-.962-.726l-1.2-6A1 1 0 014.44 4H11.055a1 1 0 01.447.106l.05.025A1 1 0 0112 6.237v5.43a1 1 0 00.657.928l2.382.794A1 1 0 0016 13.743v-.676a1 1 0 00-1-1z" />
                        </svg>
                        <span>{c.dislikeCount ?? 0}</span>
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
