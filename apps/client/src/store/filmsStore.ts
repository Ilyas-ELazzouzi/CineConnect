import { create } from 'zustand';
import type { Film } from '../lib/api';
import { filmsAPI, categoriesAPI } from '../lib/api';

interface FilmsState {
    films: Film[];
    heroFilm: Film | null;
    categories: Array<{ id: string; name: string }>;
    searchQuery: string;
    selectedCategory: string;
    isLoading: boolean;
    error: string | null;
    fetchPopularFilms: (limit?: number) => Promise<void>;
    fetchHeroFilm: () => Promise<void>;
    fetchCategories: () => Promise<void>;
    searchFilms: (query: string) => Promise<void>;
    fetchFilmsByCategory: (category: string, limit?: number) => Promise<void>;
    getFilmById: (id: string) => Promise<Film | null>;
    setSearchQuery: (query: string) => void;
    setSelectedCategory: (category: string) => void;
    clearError: () => void;
}

export const useFilmsStore = create<FilmsState>((set) => ({
    films: [],
    heroFilm: null,
    categories: [],
    searchQuery: '',
    selectedCategory: '',
    isLoading: false,
    error: null,

    fetchPopularFilms: async (limit = 20) => {
        set({ isLoading: true, error: null });
        try {
            const films = await filmsAPI.getPopular(limit);
            set({ films, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Erreur lors du chargement des films', isLoading: false });
        }
    },

    fetchHeroFilm: async () => {
        set({ isLoading: true, error: null });
        try {
            const films = await filmsAPI.getPopular(10);
            const randomIndex = Math.floor(Math.random() * Math.min(5, films.length));
            set({ heroFilm: films[randomIndex] || films[1] || films[0] || null, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Erreur lors du chargement du film hero', isLoading: false });
        }
    },

    fetchCategories: async () => {
        try {
            const data = await categoriesAPI.getAll();
            set({ categories: data.categories });
        } catch (error: any) {
            set({ error: error.message || 'Erreur lors du chargement des catégories' });
        }
    },

    searchFilms: async (query: string) => {
        set({ isLoading: true, error: null, searchQuery: query });
        try {
            const result = await filmsAPI.search(query, 1);
            set({ films: result.films, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Erreur lors de la recherche', isLoading: false });
        }
    },

    fetchFilmsByCategory: async (category: string, limit = 50) => {
        set({ isLoading: true, error: null, selectedCategory: category });
        try {
            const films = await filmsAPI.getByCategory(category, limit);
            set({ films, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Erreur lors du chargement des films', isLoading: false });
        }
    },

    getFilmById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const film = await filmsAPI.getById(id);
            set({ isLoading: false });
            return film;
        } catch (error: any) {
            set({ error: error.message || 'Erreur lors du chargement du film', isLoading: false });
            return null;
        }
    },

    setSearchQuery: (query: string) => {
        set({ searchQuery: query });
    },

    setSelectedCategory: (category: string) => {
        set({ selectedCategory: category });
    },

    clearError: () => {
        set({ error: null });
    },
}));
