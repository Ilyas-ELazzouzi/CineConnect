// Store Zustand pour gérer l'état global des films
// Centralise toute la logique de récupération et de gestion des films

import { create } from 'zustand';
import { Film } from '../lib/api';
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

