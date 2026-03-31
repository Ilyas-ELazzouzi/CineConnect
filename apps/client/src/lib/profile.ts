import { fetchWithAutoRefresh } from './authHttp';

export interface MeProfileStats {
  postsCount: number;
  filmCommentsCount: number;
  ratingsCount: number;
  friendsCount: number;
}

export interface MeProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
  createdAt: string;
  stats: MeProfileStats;
}

export interface MePost {
  id: string;
  content: string;
  filmTitle: string | null;
  imageUrl: string | null;
  viewCount: number;
  createdAt: string;
}

export interface MeFilmComment {
  id: string;
  imdbId: string;
  comment: string;
  createdAt: string;
}

export async function fetchMeProfile(token: string): Promise<{ profile: MeProfile }> {
  const res = await fetchWithAutoRefresh('/api/me/profile', token, {
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Impossible de charger le profil');
  return data as { profile: MeProfile };
}

export async function fetchMyPosts(token: string, limit = 50): Promise<{ posts: MePost[] }> {
  const params = new URLSearchParams({ limit: String(limit) });
  const res = await fetchWithAutoRefresh(`/api/me/posts?${params.toString()}`, token);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Impossible de charger les publications');
  return data as { posts: MePost[] };
}

export async function fetchMyFilmComments(
  token: string,
  limit = 50,
): Promise<{ comments: MeFilmComment[] }> {
  const params = new URLSearchParams({ limit: String(limit) });
  const res = await fetchWithAutoRefresh(`/api/me/film-comments?${params.toString()}`, token);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Impossible de charger les commentaires');
  return data as { comments: MeFilmComment[] };
}

export type PatchMeProfileInput = {
  username?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
};

export async function patchMeProfile(
  token: string,
  input: PatchMeProfileInput,
): Promise<{ profile: MeProfile }> {
  const res = await fetchWithAutoRefresh('/api/me/profile', token, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Impossible de mettre à jour le profil');
  return data as { profile: MeProfile };
}
