// Store Zustand pour gérer l'état d'authentification
// Phase 1 : Les fonctions login/register ne sont pas fonctionnelles
// Phase 2 : Sera connecté au backend avec JWT

import { create } from 'zustand';

// Interface pour représenter un utilisateur
interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string;
}

// Interface définissant la structure du store d'authentification
interface AuthState {
    user: User | null; // Utilisateur actuellement connecté
    token: string | null; // Token JWT d'authentification
    isAuthenticated: boolean; // Indicateur de connexion

    // Actions
    login: (email: string, password: string) => Promise<void>; // Connecte un utilisateur
    register: (username: string, email: string, password: string) => Promise<void>; // Inscrit un nouvel utilisateur
    logout: () => void; // Déconnecte l'utilisateur
    setUser: (user: User | null) => void; // Met à jour les données utilisateur
    setToken: (token: string | null) => void; // Met à jour le token
}

// Création du store avec initialisation depuis localStorage
export const useAuthStore = create<AuthState>((set) => {
    // Récupérer les données sauvegardées dans localStorage au démarrage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    return {
        // État initial (depuis localStorage si disponible)
        user: storedUser ? JSON.parse(storedUser) : null,
        token: storedToken,
        isAuthenticated: !!storedToken,

        // Connecte un utilisateur avec email et mot de passe
        // Phase 1 : Lance une erreur (non implémenté)
        login: async (_email: string, _password: string) => {
            throw new Error('L\'authentification sera disponible en Phase 2 (après l\'intégration du backend)');
        },

        // Inscrit un nouvel utilisateur
        // Phase 1 : Lance une erreur (non implémenté)
        register: async (_username: string, _email: string, _password: string) => {
            throw new Error('L\'inscription sera disponible en Phase 2 (après l\'intégration du backend)');
        },

        // Déconnecte l'utilisateur actuel
        // Supprime les données du store et du localStorage
        logout: () => {
            set({ user: null, token: null, isAuthenticated: false });
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },

        // Met à jour les données de l'utilisateur
        // Sauvegarde automatiquement dans localStorage
        setUser: (user: User | null) => {
            set({ user, isAuthenticated: !!user });
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
            } else {
                localStorage.removeItem('user');
            }
        },

        // Met à jour le token d'authentification
        // Sauvegarde automatiquement dans localStorage
        setToken: (token: string | null) => {
            set({ token, isAuthenticated: !!token });
            if (token) {
                localStorage.setItem('token', token);
            } else {
                localStorage.removeItem('token');
            }
        },
    };
});
