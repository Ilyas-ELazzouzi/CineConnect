// Store Zustand pour gérer l'état global des films
// Centralise toute la logique de récupération et de gestion des films

import { create } from 'zustand';
import type { Film } from '../lib/api';
import { filmsAPI, categoriesAPI } from '../lib/api';

// Interface définissant la structure du store films
interface FilmsState {
    // État
    films: Film[]; // Liste des films actuellement affichés
    heroFilm: Film | null; // Film en vedette sur la page d'accueil
    categories: Array<{ id: string; name: string }>; // Liste des catégories disponibles
    searchQuery: string; // Terme de recherche actuel
    selectedCategory: string; // Catégorie sélectionnée pour le filtrage
    isLoading: boolean; // Indicateur de chargement
    error: string | null; // Message d'erreur éventuel

    // Actions
    fetchPopularFilms: (limit?: number) => Promise<void>; // Récupère les films populaires
    fetchHeroFilm: () => Promise<void>; // Récupère un film aléatoire pour le hero
    fetchCategories: () => Promise<void>; // Récupère la liste des catégories
    searchFilms: (query: string) => Promise<void>; // Recherche des films
    fetchFilmsByCategory: (category: string, limit?: number) => Promise<void>; // Récupère les films d'une catégorie
    getFilmById: (id: string) => Promise<Film | null>; // Récupère un film par son ID
    setSearchQuery: (query: string) => void; // Met à jour le terme de recherche
    setSelectedCategory: (category: string) => void; // Met à jour la catégorie sélectionnée
    clearError: () => void; // Efface l'erreur actuelle
}

// Création du store avec Zustand
export const useFilmsStore = create<FilmsState>((set) => ({
    // État initial
    films: [],
    heroFilm: null,
    categories: [],
    searchQuery: '',
    selectedCategory: '',
    isLoading: false,
    error: null,

    // Récupère une liste de films populaires
    // Utilise plusieurs termes de recherche pour obtenir une variété
    fetchPopularFilms: async (limit = 20) => {
        set({ isLoading: true, error: null });
        try {
            const films = await filmsAPI.getPopular(limit);
            set({ films, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Erreur lors du chargement des films', isLoading: false });
        }
    },

    // Récupère un film aléatoire pour la section hero de la page d'accueil
    // Sélectionne parmi les 5 premiers films populaires
    fetchHeroFilm: async () => {
        set({ isLoading: true, error: null });
        try {
            const films = await filmsAPI.getPopular(10);
            // Sélectionner un film aléatoire parmi les 5 premiers pour varier
            const randomIndex = Math.floor(Math.random() * Math.min(5, films.length));
            set({ heroFilm: films[randomIndex] || films[1] || films[0] || null, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Erreur lors du chargement du film hero', isLoading: false });
        }
    },

    // Récupère la liste des catégories disponibles
    fetchCategories: async () => {
        try {
            const data = await categoriesAPI.getAll();
            set({ categories: data.categories });
        } catch (error: any) {
            set({ error: error.message || 'Erreur lors du chargement des catégories' });
        }
    },

    // Recherche des films par terme de recherche
    // Met à jour la liste des films avec les résultats
    searchFilms: async (query: string) => {
        set({ isLoading: true, error: null, searchQuery: query });
        try {
            const result = await filmsAPI.search(query, 1);
            set({ films: result.films, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Erreur lors de la recherche', isLoading: false });
        }
    },

    // Récupère les films d'une catégorie spécifique
    fetchFilmsByCategory: async (category: string, limit = 50) => {
        set({ isLoading: true, error: null, selectedCategory: category });
        try {
            const films = await filmsAPI.getByCategory(category, limit);
            set({ films, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Erreur lors du chargement des films', isLoading: false });
        }
    },

    // Récupère un film spécifique par son ID IMDb
    // Retourne null si le film n'est pas trouvé
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

    // Met à jour le terme de recherche sans déclencher de recherche
    setSearchQuery: (query: string) => {
        set({ searchQuery: query });
    },

    // Met à jour la catégorie sélectionnée
    setSelectedCategory: (category: string) => {
        set({ selectedCategory: category });
    },

    // Efface le message d'erreur actuel
    clearError: () => {
        set({ error: null });
    },
}));
