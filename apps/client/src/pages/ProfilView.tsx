import { useCallback, useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useAuthStore } from '../hooks';
import {
  type MeFilmComment,
  type MePost,
  type MeProfile,
  fetchMeProfile,
  fetchMyFilmComments,
  fetchMyPosts,
  patchMeProfile,
} from '../lib/profile';

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export const ProfilView = () => {
  const { token, isAuthenticated, setUser } = useAuthStore();

  const [profile, setProfile] = useState<MeProfile | null>(null);
  const [posts, setPosts] = useState<MePost[]>([]);
  const [comments, setComments] = useState<MeFilmComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [p, ps, cs] = await Promise.all([
        fetchMeProfile(token),
        fetchMyPosts(token, 100),
        fetchMyFilmComments(token, 100),
      ]);
      setProfile(p.profile);
      setPosts(ps.posts);
      setComments(cs.comments);
      setUser({
        id: p.profile.id,
        username: p.profile.username,
        email: p.profile.email,
        avatarUrl: p.profile.avatarUrl,
        bio: p.profile.bio,
        coverUrl: p.profile.coverUrl,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erreur de chargement';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token, setUser]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setLoading(false);
      setProfile(null);
      return;
    }
    void loadAll();
  }, [isAuthenticated, token, loadAll]);

  const openEdit = () => {
    if (!profile) return;
    setEditUsername(profile.username);
    setEditBio(profile.bio ?? '');
    setEditAvatarUrl(profile.avatarUrl ?? '');
    setEditCoverUrl(profile.coverUrl ?? '');
    setSaveError(null);
    setEditOpen(true);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !profile) return;
    setSaving(true);
    setSaveError(null);
    try {
      const { profile: next } = await patchMeProfile(token, {
        username: editUsername.trim() !== profile.username ? editUsername.trim() : undefined,
        bio: editBio.trim() === '' ? null : editBio.trim(),
        avatarUrl: editAvatarUrl.trim() === '' ? null : editAvatarUrl.trim(),
        coverUrl: editCoverUrl.trim() === '' ? null : editCoverUrl.trim(),
      });
      setProfile(next);
      setUser({
        id: next.id,
        username: next.username,
        email: next.email,
        avatarUrl: next.avatarUrl,
        bio: next.bio,
        coverUrl: next.coverUrl,
      });
      setEditOpen(false);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Échec de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated || !token) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto rounded-2xl border border-gray-800 bg-gray-950/80 p-10 text-center">
          <h1 className="text-2xl font-display font-bold text-white mb-3">Profil</h1>
          <p className="text-gray-400 mb-8">
            Connectez-vous pour afficher votre profil, vos publications et vos commentaires sur les films.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-xl bg-[#9747FF] px-8 py-3 font-semibold text-white hover:bg-[#7c3aed] transition-colors"
          >
            Connexion
          </Link>
        </div>
      </div>
    );
  }

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-black pt-24 flex items-center justify-center text-gray-400">
        Chargement du profil…
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-black pt-24 px-4">
        <div className="max-w-xl mx-auto rounded-xl border border-red-900/50 bg-red-950/30 p-6 text-red-200">
          {error}
          <button
            type="button"
            onClick={() => void loadAll()}
            className="mt-4 block text-[#9747FF] underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const s = profile.stats;

  return (
    <div className="min-h-screen bg-black pt-16">
      <div className="relative">
        <div
          className="h-44 sm:h-52 w-full bg-gradient-to-r from-[#9747FF]/30 to-gray-900 bg-cover bg-center"
          style={
            profile.coverUrl
              ? { backgroundImage: `url(${profile.coverUrl})` }
              : undefined
          }
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 relative z-10 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="shrink-0">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt=""
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-black object-cover shadow-xl"
                />
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-black bg-gradient-to-br from-[#9747FF] to-gray-800 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                  {profile.username.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white truncate">
                {profile.username}
              </h1>
              <p className="text-[#9747FF] text-sm font-medium">@{profile.username}</p>
              {profile.bio ? (
                <p className="mt-3 text-gray-300 text-sm sm:text-base max-w-2xl whitespace-pre-wrap">
                  {profile.bio}
                </p>
              ) : (
                <p className="mt-3 text-gray-500 text-sm italic">Aucune bio pour le moment.</p>
              )}
            </div>
            <button
              type="button"
              onClick={openEdit}
              className="self-start sm:self-end shrink-0 rounded-xl border border-gray-700 bg-gray-900/80 px-5 py-2.5 text-sm font-medium text-white hover:border-[#9747FF]/50 hover:bg-gray-800 transition-colors"
            >
              Modifier le profil
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Publications', value: s.postsCount },
              { label: 'Commentaires films', value: s.filmCommentsCount },
              { label: 'Notes', value: s.ratingsCount },
              { label: 'Amis', value: s.friendsCount },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-gray-800 bg-gray-950/60 px-4 py-3 text-center"
              >
                <div className="text-2xl font-bold text-white">{item.value}</div>
                <div className="text-xs text-gray-500 mt-1">{item.label}</div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs text-gray-600">
            Membre depuis {formatDate(profile.createdAt)}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 space-y-12">
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="h-px flex-1 bg-gray-800" />
            Publications
            <span className="h-px flex-1 bg-gray-800" />
          </h2>
          {posts.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune publication pour l’instant.</p>
          ) : (
            <ul className="space-y-4">
              {posts.map((p) => (
                <li
                  key={p.id}
                  className="rounded-xl border border-gray-800 bg-gray-950/50 p-4"
                >
                  {p.filmTitle && (
                    <p className="text-xs text-[#9747FF] mb-2">{p.filmTitle}</p>
                  )}
                  <p className="text-gray-200 whitespace-pre-wrap">{p.content}</p>
                  {p.imageUrl && (
                    <img src={p.imageUrl} alt="" className="mt-3 rounded-lg max-h-48 object-cover" />
                  )}
                  <p className="text-xs text-gray-600 mt-3">
                    {formatDate(p.createdAt)} · {p.viewCount} vues
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="h-px flex-1 bg-gray-800" />
            Commentaires sur les films
            <span className="h-px flex-1 bg-gray-800" />
          </h2>
          {comments.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun commentaire sur les films.</p>
          ) : (
            <ul className="space-y-3">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="rounded-xl border border-gray-800 bg-gray-950/50 p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/film/$id"
                      params={{ id: c.imdbId }}
                      className="text-sm text-[#9747FF] hover:underline font-medium"
                    >
                      Film · {c.imdbId}
                    </Link>
                    <p className="text-gray-300 mt-2 whitespace-pre-wrap">{c.comment}</p>
                  </div>
                  <time className="text-xs text-gray-600 shrink-0">{formatDate(c.createdAt)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {editOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            role="presentation"
            onClick={() => !saving && setEditOpen(false)}
          />
          <form
            onSubmit={submitEdit}
            className="relative z-10 w-full max-w-md rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">Modifier le profil</h3>
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs text-gray-500">Pseudo</span>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-white text-sm"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  minLength={3}
                  maxLength={30}
                  required
                />
              </label>
              <label className="block">
                <span className="text-xs text-gray-500">Bio</span>
                <textarea
                  className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-white text-sm min-h-[88px]"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  maxLength={500}
                />
              </label>
              <label className="block">
                <span className="text-xs text-gray-500">URL photo de profil</span>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-white text-sm"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  placeholder="https://…"
                />
              </label>
              <label className="block">
                <span className="text-xs text-gray-500">URL photo de couverture</span>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-white text-sm"
                  value={editCoverUrl}
                  onChange={(e) => setEditCoverUrl(e.target.value)}
                  placeholder="https://…"
                />
              </label>
            </div>
            {saveError && <p className="mt-3 text-sm text-red-400">{saveError}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => setEditOpen(false)}
                className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:text-white"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#9747FF] px-5 py-2 text-sm font-semibold text-white hover:bg-[#7c3aed] disabled:opacity-50"
              >
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
