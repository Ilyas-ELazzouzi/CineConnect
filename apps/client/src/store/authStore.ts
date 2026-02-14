// Store Zustand pour gérer l'état d'authentification
// Connecté à l'API du serveur (login, register)

import { create } from 'zustand';

const getApiBase = () =>
  import.meta.env.DEV ? (import.meta.env.VITE_API_URL ?? 'http://localhost:3001') : '';

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

        // Connecte un utilisateur avec email et mot de passe (appelle l'API du serveur)
        login: async (email: string, password: string) => {
            const res = await fetch(`${getApiBase()}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Échec de connexion');
            const user = { id: data.user.id, username: data.user.username, email: data.user.email };
            set({ user, token: data.token, isAuthenticated: true });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(user));
        },

        // Inscrit un nouvel utilisateur (appelle l'API du serveur)
        register: async (username: string, email: string, password: string) => {
            const res = await fetch(`${getApiBase()}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Échec d\'inscription');
            const user = { id: data.user.id, username: data.user.username, email: data.user.email };
            set({ user, token: data.token, isAuthenticated: true });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(user));
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
