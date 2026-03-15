const getApiBase = () =>
  import.meta.env.DEV ? (import.meta.env.VITE_API_URL ?? 'http://localhost:3001') : '';

export interface FilmRatingInfo {
  averageRating: number;
  count: number;
  userRating: number | null;
}

export async function fetchFilmRating(
  imdbId: string,
  token?: string | null,
): Promise<FilmRatingInfo> {
  const base = getApiBase();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${base}/api/films/${encodeURIComponent(imdbId)}/rating`, { headers });
  const data = (await res.json()) as FilmRatingInfo & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? 'Erreur lors du chargement de la note');
  }
  return {
    averageRating: data.averageRating ?? 0,
    count: data.count ?? 0,
    userRating: data.userRating ?? null,
  };
}

export async function setFilmRating(
  imdbId: string,
  rating: number,
  token: string,
): Promise<FilmRatingInfo> {
  const base = getApiBase();
  const res = await fetch(`${base}/api/films/${encodeURIComponent(imdbId)}/rating`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rating }),
  });
  const data = (await res.json()) as FilmRatingInfo & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? 'Erreur lors de l\'envoi de la note');
  }
  return {
    averageRating: data.averageRating ?? 0,
    count: data.count ?? 0,
    userRating: data.userRating ?? null,
  };
}
