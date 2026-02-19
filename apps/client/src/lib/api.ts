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
    const films: Film[] = [];
    for (const movie of result.Search) {
      try {
        const details = await omdbService.getMovieById(movie.imdbID);
        const transformed = transformOMDbMovie(details);
        films.push(transformed);
      } catch (error) {
        console.error(`Erreur lors de la récupération de ${movie.imdbID}:`, error);
      }
    }
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
    const allFilms: Film[] = [];
    const seenIds = new Set<string>();

    for (const term of searchTerms) {
      if (allFilms.length >= limit) break;
      try {
        const result = await omdbService.searchMovies(term, 1);
        if (result.Search) {
          for (const movie of result.Search.slice(0, 5)) {
            if (seenIds.has(movie.imdbID) || allFilms.length >= limit) continue;
            try {
              const details = await omdbService.getMovieById(movie.imdbID);
              const transformed = transformOMDbMovie(details);
              allFilms.push(transformed);
              seenIds.add(movie.imdbID);
            } catch (error) {
              console.error(`Erreur pour ${movie.imdbID}:`, error);
            }
          }
        }
      } catch (error) {
        console.error(`Erreur lors de la recherche "${term}":`, error);
      }
    }
    return allFilms;
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
    const films: Film[] = [];
    for (const movie of result.Search.slice(0, limit)) {
      try {
        const details = await omdbService.getMovieById(movie.imdbID);
        const transformed = transformOMDbMovie(details);
        if (transformed.categories?.includes(category.toLowerCase())) {
          films.push(transformed);
        }
      } catch (error) {
        console.error(`Erreur pour ${movie.imdbID}:`, error);
      }
    }
    return films;
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
