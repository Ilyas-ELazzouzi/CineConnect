// API client pour interagir avec l'API de films
// Utilise l'API OMDb pour récupérer les informations sur les films

export interface Film {
  id: string; // IMDb ID
  title: string;
  year?: string;
  poster?: string;
  plot?: string;
  rating?: string;
  runtime?: string;
  categories?: string[];
  director?: string;
  actors?: string;
}

export interface FilmsResponse {
  films: Film[];
  totalResults?: number;
}

export interface CategoriesResponse {
  categories: Array<{ id: string; name: string }>;
}

// API Key OMDb (à remplacer par votre clé)
const OMDB_API_KEY = 'demo'; // Remplacez par votre clé API
const OMDB_BASE_URL = 'https://www.omdbapi.com/';

// Fonction utilitaire pour faire des requêtes à l'API
async function fetchOMDb(params: Record<string, string>): Promise<any> {
  const queryParams = new URLSearchParams({
    apikey: OMDB_API_KEY,
    ...params,
  });
  
  const response = await fetch(`${OMDB_BASE_URL}?${queryParams}`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}

// API pour les films
export const filmsAPI = {
  // Récupère les films populaires (utilise plusieurs recherches)
  async getPopular(limit: number = 20): Promise<Film[]> {
    const searchTerms = ['movie', 'action', 'drama', 'comedy', 'thriller'];
    const films: Film[] = [];
    
    for (const term of searchTerms) {
      if (films.length >= limit) break;
      
      try {
        const data = await fetchOMDb({ s: term, type: 'movie' });
        if (data.Search) {
          const batch = data.Search.slice(0, Math.ceil(limit / searchTerms.length));
          for (const item of batch) {
            if (films.length >= limit) break;
            const detail = await this.getById(item.imdbID);
            if (detail) films.push(detail);
          }
        }
      } catch (error) {
        console.error(`Error fetching films for term "${term}":`, error);
      }
    }
    
    return films;
  },

  // Récupère un film par son ID IMDb
  async getById(id: string): Promise<Film | null> {
    try {
      const data = await fetchOMDb({ i: id });
      if (data.Error) return null;
      
      return {
        id: data.imdbID,
        title: data.Title,
        year: data.Year,
        poster: data.Poster,
        plot: data.Plot,
        rating: data.imdbRating,
        runtime: data.Runtime,
        director: data.Director,
        actors: data.Actors,
        categories: data.Genre ? data.Genre.split(', ').map((g: string) => g.trim()) : [],
      };
    } catch (error) {
      console.error(`Error fetching film ${id}:`, error);
      return null;
    }
  },

  // Recherche des films
  async search(query: string, page: number = 1): Promise<FilmsResponse> {
    try {
      const data = await fetchOMDb({ s: query, type: 'movie', page: page.toString() });
      if (data.Error) {
        return { films: [], totalResults: 0 };
      }
      
      const films = await Promise.all(
        (data.Search || []).map((item: any) => this.getById(item.imdbID))
      );
      
      return {
        films: films.filter((f): f is Film => f !== null),
        totalResults: parseInt(data.totalResults) || 0,
      };
    } catch (error) {
      console.error(`Error searching films:`, error);
      return { films: [], totalResults: 0 };
    }
  },

  // Récupère les films d'une catégorie
  async getByCategory(category: string, limit: number = 50): Promise<Film[]> {
    try {
      const data = await fetchOMDb({ s: category, type: 'movie' });
      if (data.Error || !data.Search) return [];
      
      const films = await Promise.all(
        data.Search.slice(0, limit).map((item: any) => this.getById(item.imdbID))
      );
      
      return films.filter((f): f is Film => f !== null);
    } catch (error) {
      console.error(`Error fetching films by category:`, error);
      return [];
    }
  },
};

// API pour les catégories
export const categoriesAPI = {
  // Récupère toutes les catégories disponibles
  async getAll(): Promise<CategoriesResponse> {
    // Catégories prédéfinies (dans un vrai projet, cela viendrait de l'API)
    return {
      categories: [
        { id: 'action', name: 'Action' },
        { id: 'drama', name: 'Drama' },
        { id: 'comedy', name: 'Comedy' },
        { id: 'thriller', name: 'Thriller' },
        { id: 'horror', name: 'Horror' },
        { id: 'sci-fi', name: 'Science Fiction' },
        { id: 'romance', name: 'Romance' },
        { id: 'adventure', name: 'Adventure' },
      ],
    };
  },
};
