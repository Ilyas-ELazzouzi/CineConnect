const getApiBase = () =>
  import.meta.env.DEV ? (import.meta.env.VITE_API_URL ?? 'http://localhost:3001') : '';

export interface OMDbMovie {
  imdbID: string;
  Title: string;
  Year: string;
  Rated?: string;
  Released?: string;
  Runtime?: string;
  Genre?: string;
  Director?: string;
  Writer?: string;
  Actors?: string;
  Plot?: string;
  Language?: string;
  Country?: string;
  Awards?: string;
  Poster: string;
  Ratings?: Array<{
    Source: string;
    Value: string;
  }>;
  Metascore?: string;
  imdbRating?: string;
  imdbVotes?: string;
  Type: string;
  DVD?: string;
  BoxOffice?: string;
  Production?: string;
  Website?: string;
  Response: string;
}

export interface OMDbSearchResult {
  Search?: Array<{
    Title: string;
    Year: string;
    imdbID: string;
    Type: string;
    Poster: string;
  }>;
  totalResults?: string;
  Response: string;
  Error?: string;
}

export function convertImdbRatingTo5(imdbRating: string): number {
  const rating = parseFloat(imdbRating);
  if (isNaN(rating)) return 0;
  return Math.round((rating / 10) * 5 * 10) / 10;
}

export function mapGenresToCategories(genreString?: string): string[] {
  if (!genreString) return [];
  const genres = genreString.split(',').map(g => g.trim().toLowerCase());
  const categoryMap: Record<string, string> = {
    'action': 'action',
    'adventure': 'aventure',
    'animation': 'animation',
    'biography': 'biographie',
    'comedy': 'comedie',
    'crime': 'crime',
    'drama': 'drame',
    'family': 'famille',
    'fantasy': 'fantastique',
    'film-noir': 'noir',
    'history': 'histoire',
    'horror': 'horreur',
    'music': 'musique',
    'musical': 'musical',
    'mystery': 'mystere',
    'romance': 'romance',
    'sci-fi': 'science-fiction',
    'science fiction': 'science-fiction',
    'sport': 'sport',
    'thriller': 'thriller',
    'war': 'guerre',
    'western': 'western',
  };
  const categories: string[] = [];
  for (const genre of genres) {
    const category = categoryMap[genre];
    if (category && !categories.includes(category)) {
      categories.push(category);
    }
  }
  return categories;
}

export const omdbService = {
  searchMovies: async (query: string, page: number = 1): Promise<OMDbSearchResult> => {
    const base = getApiBase();
    const url = `${base}/api/omdb/search?s=${encodeURIComponent(query)}&page=${page}`;
    const res = await fetch(url);
    const data = (await res.json()) as OMDbSearchResult & { error?: string };
    if (!res.ok) throw new Error(data.error ?? 'Erreur OMDb');
    return data;
  },

  getMovieById: async (imdbId: string): Promise<OMDbMovie> => {
    const base = getApiBase();
    const res = await fetch(`${base}/api/omdb/movie/${encodeURIComponent(imdbId)}`);
    const data = (await res.json()) as OMDbMovie & { error?: string };
    if (!res.ok) throw new Error(data.error ?? 'Film non trouvé');
    if (data.Response === 'False') throw new Error((data as { Error?: string }).Error ?? 'Film non trouvé');
    return data;
  },

  searchByGenre: async (genre: string, page: number = 1): Promise<OMDbSearchResult> => {
    return omdbService.searchMovies(genre, page);
  },
};

export function transformOMDbMovie(omdbMovie: OMDbMovie): any {
  const year = omdbMovie.Year ? parseInt(omdbMovie.Year.split('–')[0]) : null;
  const rating = omdbMovie.imdbRating
    ? convertImdbRatingTo5(omdbMovie.imdbRating)
    : 0;

  return {
    id: omdbMovie.imdbID,
    imdbId: omdbMovie.imdbID,
    title: omdbMovie.Title,
    year: year,
    director: omdbMovie.Director || undefined,
    plot: omdbMovie.Plot || undefined,
    poster: omdbMovie.Poster !== 'N/A' ? omdbMovie.Poster : null,
    rating: rating,
    categories: mapGenresToCategories(omdbMovie.Genre),
    actors: omdbMovie.Actors,
    runtime: omdbMovie.Runtime,
    genre: omdbMovie.Genre,
    imdbRating: omdbMovie.imdbRating,
  };
}
