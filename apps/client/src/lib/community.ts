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
}

export interface TrendingTopic {
  name: string;
  postCount: number;
}

export async function fetchCommunityPosts(limit: number = 50): Promise<CommunityPost[]> {
  const base = getApiBase();
  const res = await fetch(`${base}/api/community/posts?limit=${limit}`);
  const data = (await res.json()) as { posts?: CommunityPost[]; error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? 'Erreur lors du chargement des posts');
  }
  return data.posts ?? [];
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

