// Service pour interagir avec l'API OMDb via le proxy du serveur
// La clé API reste côté serveur, le client appelle /api/omdb/*

const getApiBase = () =>
  import.meta.env.DEV ? (import.meta.env.VITE_API_URL ?? 'http://localhost:3001') : '';

// Interface pour les données d'un film retournées par OMDb
// Correspond exactement au format JSON de l'API
export interface OMDbMovie {
  imdbID: string; // Identifiant unique IMDb
  Title: string; // Titre du film
  Year: string; // Année (peut contenir des plages comme "2000-2005")
  Rated?: string; // Classification (PG, R, etc.)
  Released?: string; // Date de sortie
  Runtime?: string; // Durée en minutes
  Genre?: string; // Genres séparés par des virgules
  Director?: string; // Réalisateur
  Writer?: string; // Scénaristes
  Actors?: string; // Acteurs principaux
  Plot?: string; // Synopsis
  Language?: string; // Langues
  Country?: string; // Pays de production
  Awards?: string; // Récompenses
  Poster: string; // URL de l'affiche
  Ratings?: Array<{ // Notes de différentes sources
    Source: string;
    Value: string;
  }>;
  Metascore?: string; // Score Metacritic
  imdbRating?: string; // Note IMDb sur 10
  imdbVotes?: string; // Nombre de votes
  Type: string; // Type (movie, series, etc.)
  DVD?: string; // Date de sortie DVD
  BoxOffice?: string; // Recettes au box-office
  Production?: string; // Studio de production
  Website?: string; // Site web officiel
  Response: string; // "True" ou "False" selon le succès
}

// Interface pour les résultats de recherche OMDb
export interface OMDbSearchResult {
  Search?: Array<{ // Tableau de résultats (peut être undefined si erreur)
    Title: string;
    Year: string;
    imdbID: string;
    Type: string;
    Poster: string;
  }>;
  totalResults?: string; // Nombre total de résultats (string car OMDb)
  Response: string; // "True" ou "False"
  Error?: string; // Message d'erreur si Response = "False"
}

// Convertir une note IMDb (sur 10) en note sur 5
// Utile pour l'affichage dans l'interface
export function convertImdbRatingTo5(imdbRating: string): number {
  const rating = parseFloat(imdbRating);
  if (isNaN(rating)) return 0;
  // Conversion simple : note / 2
  return Math.round((rating / 10) * 5 * 10) / 10;
}

// Mapper les genres OMDb vers les catégories utilisées dans l'application
// OMDb utilise des genres en anglais, on les convertit en français
export function mapGenresToCategories(genreString?: string): string[] {
  if (!genreString) return [];
  
  // Séparer les genres (séparés par des virgules dans OMDb)
  const genres = genreString.split(',').map(g => g.trim().toLowerCase());
  
  // Tableau de correspondance entre genres OMDb et catégories de l'app
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

  // Convertir chaque genre et éviter les doublons
  const categories: string[] = [];
  for (const genre of genres) {
    const category = categoryMap[genre];
    if (category && !categories.includes(category)) {
      categories.push(category);
    }
  }

  return categories;
}

// Service principal : appelle le proxy du serveur /api/omdb/*
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

// Transformer un film OMDb en format compatible avec l'application
// Convertit les données brutes d'OMDb vers notre interface Film
export function transformOMDbMovie(omdbMovie: OMDbMovie): any {
  // Extraire l'année (prendre seulement la première si c'est une plage)
  const year = omdbMovie.Year ? parseInt(omdbMovie.Year.split('–')[0]) : null;
  
  // Convertir la note IMDb sur 10 vers une note sur 5
  const rating = omdbMovie.imdbRating 
    ? convertImdbRatingTo5(omdbMovie.imdbRating)
    : 0;

  return {
    id: omdbMovie.imdbID, // Utiliser l'ID IMDb comme identifiant unique
    imdbId: omdbMovie.imdbID,
    title: omdbMovie.Title,
    year: year,
    director: omdbMovie.Director || undefined,
    plot: omdbMovie.Plot || undefined,
    poster: omdbMovie.Poster !== 'N/A' ? omdbMovie.Poster : null, // OMDb retourne "N/A" si pas d'affiche
    rating: rating,
    categories: mapGenresToCategories(omdbMovie.Genre), // Convertir les genres
    // Données supplémentaires conservées telles quelles
    actors: omdbMovie.Actors,
    runtime: omdbMovie.Runtime,
    genre: omdbMovie.Genre,
    imdbRating: omdbMovie.imdbRating,
  };
}
