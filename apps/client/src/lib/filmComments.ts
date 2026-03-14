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
}

export async function fetchFilmComments(imdbId: string): Promise<FilmComment[]> {
  const base = getApiBase();
  const res = await fetch(`${base}/api/films/${encodeURIComponent(imdbId)}/comments`);
  const data = (await res.json()) as { comments?: FilmComment[]; error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? 'Erreur lors du chargement des commentaires');
  }
  return data.comments ?? [];
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
