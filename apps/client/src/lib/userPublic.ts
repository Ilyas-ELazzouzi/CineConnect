const getApiBase = () =>
  import.meta.env.DEV ? (import.meta.env.VITE_API_URL ?? 'http://localhost:3001') : '';

export interface PublicProfileStats {
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

export interface PublicUserProfilePayload {
  id: string;
  username: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
  createdAt: string;
  stats: PublicProfileStats;
  viewerFollows: boolean;
  isSelf: boolean;
}

export interface PublicUserPost {
  id: string;
  content: string;
  filmTitle: string | null;
  imageUrl: string | null;
  viewCount: number;
  createdAt: string;
}

export interface PublicUserSummary {
  id: string;
  username: string;
  avatarUrl: string | null;
}

function authHeaders(token?: string | null): HeadersInit {
  const h: Record<string, string> = {};
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export async function fetchPublicProfile(
  userId: string,
  token?: string | null,
): Promise<{ profile: PublicUserProfilePayload }> {
  const base = getApiBase();
  const res = await fetch(`${base}/api/users/${encodeURIComponent(userId)}/profile`, {
    headers: authHeaders(token),
  });
  const data = (await res.json()) as { profile?: PublicUserProfilePayload; error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Profil introuvable');
  if (!data.profile) throw new Error('Réponse invalide');
  return { profile: data.profile };
}

export async function fetchUserPosts(
  userId: string,
  limit = 50,
): Promise<{ posts: PublicUserPost[] }> {
  const base = getApiBase();
  const params = new URLSearchParams({ limit: String(limit) });
  const res = await fetch(`${base}/api/users/${encodeURIComponent(userId)}/posts?${params}`);
  const data = (await res.json()) as { posts?: PublicUserPost[]; error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Impossible de charger les publications');
  return { posts: data.posts ?? [] };
}

export async function fetchUserFollowers(
  userId: string,
  limit = 50,
): Promise<{ users: PublicUserSummary[] }> {
  const base = getApiBase();
  const params = new URLSearchParams({ limit: String(limit) });
  const res = await fetch(
    `${base}/api/users/${encodeURIComponent(userId)}/followers?${params}`,
  );
  const data = (await res.json()) as { users?: PublicUserSummary[]; error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Impossible de charger les abonnés');
  return { users: data.users ?? [] };
}

export async function fetchUserFollowing(
  userId: string,
  limit = 50,
): Promise<{ users: PublicUserSummary[] }> {
  const base = getApiBase();
  const params = new URLSearchParams({ limit: String(limit) });
  const res = await fetch(
    `${base}/api/users/${encodeURIComponent(userId)}/following?${params}`,
  );
  const data = (await res.json()) as { users?: PublicUserSummary[]; error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Impossible de charger les abonnements');
  return { users: data.users ?? [] };
}

export async function followUser(userId: string, token: string): Promise<void> {
  const base = getApiBase();
  const res = await fetch(`${base}/api/users/${encodeURIComponent(userId)}/follow`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
  });
  const data = (await res.json()) as { error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Impossible de suivre cet utilisateur');
}

export async function unfollowUser(userId: string, token: string): Promise<void> {
  const base = getApiBase();
  const res = await fetch(`${base}/api/users/${encodeURIComponent(userId)}/follow`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const data = (await res.json()) as { error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Impossible de vous désabonner');
}

/** Identifiant de salon privé entre deux utilisateurs (côté client / socket). */
export function dmRoomIdForPair(userIdA: string, userIdB: string): string {
  const [a, b] = [userIdA, userIdB].sort();
  return `dm_${a}_${b}`;
}
