import { create } from 'zustand';

const getApiBase = () =>
  import.meta.env.DEV ? (import.meta.env.VITE_API_URL ?? 'http://localhost:3001') : '';

export interface AuthUser {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string | null;
    bio?: string | null;
    coverUrl?: string | null;
}

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    setUser: (user: AuthUser | null) => void;
    setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    return {
        user: storedUser ? JSON.parse(storedUser) : null,
        token: storedToken,
        isAuthenticated: !!storedToken,

        login: async (email: string, password: string) => {
            const res = await fetch(`${getApiBase()}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Échec de connexion');
            const user: AuthUser = {
                id: data.user.id,
                username: data.user.username,
                email: data.user.email,
            };
            set({ user, token: data.token, isAuthenticated: true });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(user));
        },

        register: async (username: string, email: string, password: string) => {
            const res = await fetch(`${getApiBase()}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Échec d\'inscription');
            const user: AuthUser = {
                id: data.user.id,
                username: data.user.username,
                email: data.user.email,
            };
            set({ user, token: data.token, isAuthenticated: true });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(user));
        },

        logout: () => {
            set({ user: null, token: null, isAuthenticated: false });
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },

        setUser: (user: AuthUser | null) => {
            set({ user, isAuthenticated: !!user });
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
            } else {
                localStorage.removeItem('user');
            }
        },

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
