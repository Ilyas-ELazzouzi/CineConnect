const getApiBase = () =>
  import.meta.env.DEV ? (import.meta.env.VITE_API_URL ?? 'http://localhost:3001') : '';

export interface CommunityAuthor {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface CommunityPost {
  id: string;
  userId: string;
  content: string;
  filmTitle: string | null;
  imageUrl: string | null;
  viewCount: number;
  createdAt: string;
  author: CommunityAuthor | null;
  commentCount: number;
  likeCount: number;
  dislikeCount?: number;
  userReaction?: number | null;
}

export interface PostReactionResult {
  likeCount: number;
  dislikeCount: number;
  userReaction: number | null;
}

export interface TrendingTopic {
  name: string;
  postCount: number;
}

export type CommunityFeedSort = 'all' | 'trending' | 'hot';

export async function fetchCommunityPosts(
  limit: number = 50,
  token?: string | null,
  sort: CommunityFeedSort = 'all',
): Promise<CommunityPost[]> {
  const base = getApiBase();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const params = new URLSearchParams({
    limit: String(limit),
    sort,
  });
  const res = await fetch(`${base}/api/community/posts?${params.toString()}`, { headers });
  const data = (await res.json()) as { posts?: CommunityPost[]; error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? 'Erreur lors du chargement des posts');
  }
  return data.posts ?? [];
}

export async function setPostReaction(
  postId: string,
  value: 1 | -1,
  token: string,
): Promise<PostReactionResult> {
  const base = getApiBase();
  const res = await fetch(`${base}/api/community/posts/${encodeURIComponent(postId)}/reaction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ value }),
  });
  const data = (await res.json()) as {
    likeCount?: number;
    dislikeCount?: number;
    userReaction?: number | null;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data.error ?? 'Erreur lors de la réaction');
  }
  return {
    likeCount: data.likeCount ?? 0,
    dislikeCount: data.dislikeCount ?? 0,
    userReaction: data.userReaction ?? null,
  };
}

export async function fetchTrendingTopics(limit: number = 10): Promise<TrendingTopic[]> {
  const base = getApiBase();
  const res = await fetch(`${base}/api/community/posts/trending?limit=${limit}`);
  const data = (await res.json()) as { topics?: TrendingTopic[]; error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? 'Erreur lors du chargement des sujets tendances');
  }
  return data.topics ?? [];
}

export async function createCommunityPost(
  input: { content: string; filmTitle?: string; imageUrl?: string },
  token: string,
): Promise<CommunityPost> {
  const base = getApiBase();
  const res = await fetch(`${base}/api/community/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  const data = (await res.json()) as { post?: CommunityPost; error?: string };
  if (!res.ok || !data.post) {
    throw new Error(data.error ?? 'Erreur lors de la création du post');
  }
  return data.post;
}

