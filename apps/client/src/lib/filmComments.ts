const getApiBase = () =>
  import.meta.env.DEV ? (import.meta.env.VITE_API_URL ?? 'http://localhost:3001') : '';

export interface FilmCommentAuthor {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface FilmComment {
  id: string;
  imdbId: string;
  userId: string;
  comment: string;
  createdAt: string;
  author: FilmCommentAuthor | null;
  likeCount?: number;
  dislikeCount?: number;
  userReaction?: number | null;
}

export interface FilmCommentReactionResult {
  likeCount: number;
  dislikeCount: number;
  userReaction: number | null;
}

export async function fetchFilmComments(
  imdbId: string,
  token?: string | null,
): Promise<FilmComment[]> {
  const base = getApiBase();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${base}/api/films/${encodeURIComponent(imdbId)}/comments`, { headers });
  const data = (await res.json()) as { comments?: FilmComment[]; error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? 'Erreur lors du chargement des commentaires');
  }
  return data.comments ?? [];
}

export async function setFilmCommentReaction(
  imdbId: string,
  commentId: string,
  value: 1 | -1,
  token: string,
): Promise<FilmCommentReactionResult> {
  const base = getApiBase();
  const res = await fetch(
    `${base}/api/films/${encodeURIComponent(imdbId)}/comments/${encodeURIComponent(commentId)}/reaction`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ value }),
    },
  );
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

export async function createFilmComment(
  imdbId: string,
  content: string,
  token: string,
): Promise<FilmComment> {
  const base = getApiBase();
  const res = await fetch(`${base}/api/films/${encodeURIComponent(imdbId)}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
  const data = (await res.json()) as { comment?: FilmComment; error?: string };
  if (!res.ok || !data.comment) {
    throw new Error(data.error ?? 'Erreur lors de l\'envoi du commentaire');
  }
  return data.comment;
}
