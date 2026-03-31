import { omdbService, transformOMDbMovie } from './omdb';

export interface Film {
  id: string;
  imdbId?: string;
  title: string;
  year?: number;
  director?: string;
  plot?: string;
  poster?: string;
  rating?: number;
  categories?: string[];
  actors?: string;
  runtime?: string;
  genre?: string;
  imdbRating?: string;
}

export const CATEGORIES = [
  'action',
  'aventure',
  'animation',
  'biographie',
  'comedie',
  'crime',
  'drame',
  'famille',
  'fantastique',
  'guerre',
  'histoire',
  'horreur',
  'musique',
  'musical',
  'mystere',
  'romance',
  'science-fiction',
  'sport',
  'thriller',
  'western',
];

export const filmsAPI = {
  search: async (query: string, page: number = 1): Promise<{ films: Film[]; totalResults?: number }> => {
    const result = await omdbService.searchMovies(query, page);
    if (result.Response === 'False' || !result.Search) {
      return { films: [], totalResults: 0 };
    }
    const films = await mapWithConcurrency(
      result.Search,
      6,
      async (movie) => fetchAndTransformMovie(movie.imdbID),
    );
    return {
      films,
      totalResults: result.totalResults ? parseInt(result.totalResults) : undefined,
    };
  },

  getById: async (imdbId: string): Promise<Film> => {
    const movie = await omdbService.getMovieById(imdbId);
    return transformOMDbMovie(movie);
  },

  getPopular: async (limit: number = 20): Promise<Film[]> => {
    const searchTerms = ['action', 'drama', 'comedy', 'thriller', 'adventure'];
    const candidateIds: string[] = [];
    const seenIds = new Set<string>();

    for (const term of searchTerms) {
      try {
        const result = await omdbService.searchMovies(term, 1);
        if (!result.Search) continue;
        for (const movie of result.Search.slice(0, 8)) {
          if (seenIds.has(movie.imdbID)) continue;
          seenIds.add(movie.imdbID);
          candidateIds.push(movie.imdbID);
        }
      } catch (error) {
        console.error(`Erreur lors de la recherche "${term}":`, error);
      }
    }

    const films = await mapWithConcurrency(
      candidateIds,
      6,
      async (imdbID) => fetchAndTransformMovie(imdbID),
    );
    return films.slice(0, limit);
  },

  getByCategory: async (category: string, limit: number = 20): Promise<Film[]> => {
    const categoryMap: Record<string, string> = {
      'action': 'action',
      'aventure': 'adventure',
      'animation': 'animation',
      'biographie': 'biography',
      'comedie': 'comedy',
      'crime': 'crime',
      'drame': 'drama',
      'famille': 'family',
      'fantastique': 'fantasy',
      'guerre': 'war',
      'histoire': 'history',
      'horreur': 'horror',
      'musique': 'music',
      'musical': 'musical',
      'mystere': 'mystery',
      'romance': 'romance',
      'science-fiction': 'sci-fi',
      'sport': 'sport',
      'thriller': 'thriller',
      'western': 'western',
    };
    const searchTerm = categoryMap[category.toLowerCase()] || category;
    const result = await omdbService.searchByGenre(searchTerm, 1);
    if (result.Response === 'False' || !result.Search) {
      return [];
    }
    const films = await mapWithConcurrency(
      result.Search.slice(0, Math.max(limit * 2, 20)),
      6,
      async (movie) => fetchAndTransformMovie(movie.imdbID),
    );
    return films.filter((f) => f.categories?.includes(category.toLowerCase())).slice(0, limit);
  },

  getAll: async (params?: { search?: string; category?: string; limit?: number }): Promise<{ films: Film[] }> => {
    const limit = params?.limit || 50;
    if (params?.search) {
      const result = await filmsAPI.search(params.search, 1);
      return { films: result.films.slice(0, limit) };
    }
    if (params?.category) {
      const films = await filmsAPI.getByCategory(params.category, limit);
      return { films };
    }
    const films = await filmsAPI.getPopular(limit);
    return { films };
  },
};

async function fetchAndTransformMovie(imdbID: string): Promise<Film | null> {
  try {
    const details = await omdbService.getMovieById(imdbID);
    return transformOMDbMovie(details);
  } catch (error) {
    console.error(`Erreur pour ${imdbID}:`, error);
    return null;
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R | null>,
): Promise<R[]> {
  if (items.length === 0) return [];

  let idx = 0;
  const out = new Array<R | null>(items.length).fill(null);
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (idx < items.length) {
      const current = idx;
      idx += 1;
      const value = await mapper(items[current] as T);
      out[current] = value;
    }
  });

  await Promise.all(workers);
  return out.filter((value): value is R => value !== null);
}

export const categoriesAPI = {
  getAll: async (): Promise<{ categories: Array<{ id: string; name: string }> }> => {
    return {
      categories: CATEGORIES.map((cat, index) => ({
        id: `cat-${index}`,
        name: cat,
      })),
    };
  },
};
