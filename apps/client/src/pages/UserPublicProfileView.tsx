import { useCallback, useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useAuthStore } from '../hooks';
import {
  type PublicUserPost,
  type PublicUserProfilePayload,
  type PublicUserSummary,
  fetchPublicProfile,
  fetchUserFollowers,
  fetchUserFollowing,
  fetchUserPosts,
  followUser,
  unfollowUser,
} from '../lib/userPublic';

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

type Props = { userId: string };

export const UserPublicProfileView = ({ userId }: Props) => {
  const { token, isAuthenticated, user: me } = useAuthStore();

  const [profile, setProfile] = useState<PublicUserProfilePayload | null>(null);
  const [posts, setPosts] = useState<PublicUserPost[]>([]);
  const [followers, setFollowers] = useState<PublicUserSummary[]>([]);
  const [following, setFollowing] = useState<PublicUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followBusy, setFollowBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, ps, fol, fing] = await Promise.all([
        fetchPublicProfile(userId, token),
        fetchUserPosts(userId, 100),
        fetchUserFollowers(userId, 100),
        fetchUserFollowing(userId, 100),
      ]);
      setProfile(p.profile);
      setPosts(ps.posts);
      setFollowers(fol.users);
      setFollowing(fing.users);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated || !token || !profile || profile.isSelf) return;
    setFollowBusy(true);
    try {
      if (profile.viewerFollows) {
        await unfollowUser(userId, token);
        setProfile((prev) => (prev ? { ...prev, viewerFollows: false } : prev));
      } else {
        await followUser(userId, token);
        setProfile((prev) => (prev ? { ...prev, viewerFollows: true } : prev));
      }
      const p = await fetchPublicProfile(userId, token);
      setProfile(p.profile);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Action impossible');
    } finally {
      setFollowBusy(false);
    }
  };

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
            profile.coverUrl ? { backgroundImage: `url(${profile.coverUrl})` } : undefined
          }
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 relative z-10 pb-6">
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
                <p className="mt-3 text-gray-500 text-sm italic">Aucune bio.</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 self-start sm:self-end">
              {profile.isSelf ? (
                <Link
                  to="/profil"
                  className="rounded-xl border border-gray-700 bg-gray-900/80 px-5 py-2.5 text-sm font-medium text-white hover:border-[#9747FF]/50"
                >
                  Mon profil (modifier)
                </Link>
              ) : (
                <>
                  {isAuthenticated && token ? (
                    <button
                      type="button"
                      disabled={followBusy}
                      onClick={() => void handleFollowToggle()}
                      className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
                        profile.viewerFollows
                          ? 'border border-gray-600 bg-gray-800 text-white hover:bg-gray-700'
                          : 'bg-[#9747FF] text-white hover:bg-[#7c3aed]'
                      }`}
                    >
                      {followBusy ? '…' : profile.viewerFollows ? 'Ne plus suivre' : 'Suivre'}
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="rounded-xl bg-[#9747FF] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7c3aed]"
                    >
                      Se connecter pour suivre
                    </Link>
                  )}
                  {isAuthenticated && me && me.id !== userId && (
                    <Link
                      to="/messages"
                      search={{ with: userId }}
                      className="rounded-xl border border-gray-700 bg-gray-900/80 px-5 py-2.5 text-sm font-medium text-white hover:border-[#9747FF]/50"
                    >
                      Message
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { label: 'Abonnés', value: s.followersCount },
              { label: 'Abonnements', value: s.followingCount },
              { label: 'Publications', value: s.postsCount },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-gray-800 bg-gray-950/60 px-3 py-3 text-center"
              >
                <div className="text-xl font-bold text-white">{item.value}</div>
                <div className="text-[11px] text-gray-500 mt-1">{item.label}</div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-gray-600">
            Membre depuis {formatDate(profile.createdAt)}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 space-y-10">
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Publications</h2>
          {posts.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune publication.</p>
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
                    <img
                      src={p.imageUrl}
                      alt=""
                      className="mt-3 rounded-lg max-h-48 object-cover"
                    />
                  )}
                  <p className="text-xs text-gray-600 mt-3">
                    {formatDate(p.createdAt)} · {p.viewCount} vues
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="grid sm:grid-cols-2 gap-8">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Abonnés</h2>
            {followers.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun abonné pour l’instant.</p>
            ) : (
              <ul className="space-y-2">
                {followers.map((u) => (
                  <li key={u.id}>
                    <Link
                      to="/user/$userId"
                      params={{ userId: u.id }}
                      className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-950/40 px-3 py-2 hover:border-[#9747FF]/40"
                    >
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white">
                          {u.username.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm text-white font-medium">{u.username}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Abonnements</h2>
            {following.length === 0 ? (
              <p className="text-gray-500 text-sm">Ne suit personne pour l’instant.</p>
            ) : (
              <ul className="space-y-2">
                {following.map((u) => (
                  <li key={u.id}>
                    <Link
                      to="/user/$userId"
                      params={{ userId: u.id }}
                      className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-950/40 px-3 py-2 hover:border-[#9747FF]/40"
                    >
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white">
                          {u.username.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm text-white font-medium">{u.username}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
