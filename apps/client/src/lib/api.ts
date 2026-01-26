// Service API pour consommer directement OMDb depuis le frontend
// Phase 1 : Frontend uniquement, sans backend
// Toutes les données proviennent directement de l'API OMDb

import { omdbService, transformOMDbMovie, mapGenresToCategories } from './omdb';

// Interface pour représenter un film dans l'application
// Les données sont transformées depuis le format OMDb vers ce format standardisé
export interface Film {
  id: string; // Identifiant unique (IMDb ID)
  imdbId?: string; // ID IMDb original
  title: string; // Titre du film
  year?: number; // Année de sortie
  director?: string; // Nom du réalisateur
  plot?: string; // Synopsis du film
  poster?: string; // URL de l'affiche
  rating?: number; // Note sur 5 (convertie depuis IMDb)
  categories?: string[]; // Catégories/genres du film
  actors?: string; // Liste des acteurs principaux
  runtime?: string; // Durée du film
  genre?: string; // Genre original depuis OMDb
  imdbRating?: string; // Note IMDb originale sur 10
}

// Liste des catégories disponibles dans l'application
// Utilisée pour filtrer et organiser les films
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

// API pour gérer les films
// Toutes les méthodes appellent directement l'API OMDb
export const filmsAPI = {
  // Rechercher des films par titre ou mot-clé
  // Retourne une liste de films correspondant à la recherche
  search: async (query: string, page: number = 1): Promise<{ films: Film[]; totalResults?: number }> => {
    const result = await omdbService.searchMovies(query, page);

    // Si aucune réponse ou erreur, retourner un tableau vide
    if (result.Response === 'False' || !result.Search) {
      return { films: [], totalResults: 0 };
    }

    // Pour chaque résultat de recherche, récupérer les détails complets
    // OMDb retourne seulement les infos basiques dans la recherche, il faut un appel supplémentaire
    const films: Film[] = [];
    for (const movie of result.Search) {
      try {
        const details = await omdbService.getMovieById(movie.imdbID);
        const transformed = transformOMDbMovie(details);
        films.push(transformed);
      } catch (error) {
        // Si un film échoue, on continue avec les autres
        console.error(`Erreur lors de la récupération de ${movie.imdbID}:`, error);
      }
    }

    return {
      films,
      totalResults: result.totalResults ? parseInt(result.totalResults) : undefined,
    };
  },

  // Récupérer un film spécifique par son ID IMDb
  getById: async (imdbId: string): Promise<Film> => {
    const movie = await omdbService.getMovieById(imdbId);
    return transformOMDbMovie(movie);
  },

  // Récupérer une liste de films populaires
  // Utilise plusieurs termes de recherche pour obtenir une variété de films
  getPopular: async (limit: number = 20): Promise<Film[]> => {
    // Termes de recherche pour obtenir des films variés
    const searchTerms = ['action', 'drama', 'comedy', 'thriller', 'adventure'];
    const allFilms: Film[] = [];
    const seenIds = new Set<string>(); // Éviter les doublons

    // Parcourir chaque terme de recherche jusqu'à atteindre la limite
    for (const term of searchTerms) {
      if (allFilms.length >= limit) break;

      try {
        const result = await omdbService.searchMovies(term, 1);
        if (result.Search) {
          // Prendre les 5 premiers résultats de chaque recherche
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

  // Récupérer des films par catégorie (genre)
  // Filtre les résultats pour ne garder que ceux correspondant à la catégorie
  getByCategory: async (category: string, limit: number = 20): Promise<Film[]> => {
    // Mapper les catégories de l'app vers les termes de recherche OMDb
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

    // Récupérer les détails et filtrer par catégorie exacte
    const films: Film[] = [];
    for (const movie of result.Search.slice(0, limit)) {
      try {
        const details = await omdbService.getMovieById(movie.imdbID);
        const transformed = transformOMDbMovie(details);
        // Vérifier que le film appartient bien à la catégorie demandée
        if (transformed.categories?.includes(category.toLowerCase())) {
          films.push(transformed);
        }
      } catch (error) {
        console.error(`Erreur pour ${movie.imdbID}:`, error);
      }
    }

    return films;
  },

  // Méthode générique pour obtenir tous les films
  // Utilise la recherche, la catégorie ou les films populaires selon les paramètres
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

    // Par défaut, retourner des films populaires
    const films = await filmsAPI.getPopular(limit);
    return { films };
  },
};

// API pour gérer les catégories
// Retourne la liste des catégories prédéfinies
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
