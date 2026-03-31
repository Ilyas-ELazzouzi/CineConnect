import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Film } from '@/lib/api';

vi.mock('../lib/api', () => ({
  filmsAPI: {
    getPopular: vi.fn(),
    getById: vi.fn(),
    search: vi.fn(),
    getByCategory: vi.fn(),
    getAll: vi.fn(),
  },
  categoriesAPI: {
    getAll: vi.fn(),
  },
}));

import { filmsAPI, categoriesAPI } from '@/lib/api';
import { useAuthStore, useFilmsStore, useUIStore } from '@/hooks';

const sampleFilm: Film = {
  id: 'tt1',
  imdbId: 'tt1',
  title: 'Film test',
  rating: 4,
};

function resetUIStore() {
  useUIStore.setState({
    isSearchOpen: false,
    isMenuOpen: false,
    theme: 'dark',
    sidebarOpen: false,
  });
}

function resetFilmsStore() {
  useFilmsStore.setState({
    films: [],
    heroFilm: null,
    categories: [],
    searchQuery: '',
    selectedCategory: '',
    isLoading: false,
    error: null,
  });
}

function resetAuthStore() {
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  localStorage.clear();
}

describe('hooks (stores Zustand)', () => {
  beforeEach(() => {
    vi.mocked(filmsAPI.getPopular).mockReset();
    vi.mocked(filmsAPI.getById).mockReset();
    vi.mocked(filmsAPI.search).mockReset();
    vi.mocked(filmsAPI.getByCategory).mockReset();
    vi.mocked(categoriesAPI.getAll).mockReset();
    resetUIStore();
    resetFilmsStore();
    resetAuthStore();
  });

  describe('useUIStore', () => {
    it('toggleSearch alterne isSearchOpen', () => {
      expect(useUIStore.getState().isSearchOpen).toBe(false);
      useUIStore.getState().toggleSearch();
      expect(useUIStore.getState().isSearchOpen).toBe(true);
      useUIStore.getState().closeSearch();
      expect(useUIStore.getState().isSearchOpen).toBe(false);
    });

    it('setTheme met à jour le thème', () => {
      useUIStore.getState().setTheme('light');
      expect(useUIStore.getState().theme).toBe('light');
    });

    it('toggleSidebar alterne sidebarOpen', () => {
      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });
  });

  describe('useFilmsStore', () => {
    it('fetchPopularFilms remplit films et termine le chargement', async () => {
      vi.mocked(filmsAPI.getPopular).mockResolvedValue([sampleFilm]);

      await useFilmsStore.getState().fetchPopularFilms(5);

      expect(useFilmsStore.getState().isLoading).toBe(false);
      expect(useFilmsStore.getState().films).toEqual([sampleFilm]);
      expect(useFilmsStore.getState().error).toBeNull();
    });

    it('fetchPopularFilms enregistre une erreur si getPopular échoue', async () => {
      vi.mocked(filmsAPI.getPopular).mockRejectedValue(new Error('réseau'));

      await useFilmsStore.getState().fetchPopularFilms();

      expect(useFilmsStore.getState().films).toEqual([]);
      expect(useFilmsStore.getState().error).toBe('réseau');
      expect(useFilmsStore.getState().isLoading).toBe(false);
    });

    it('setSearchQuery et clearError mettent à jour le state', () => {
      useFilmsStore.getState().setSearchQuery('batman');
      expect(useFilmsStore.getState().searchQuery).toBe('batman');

      useFilmsStore.setState({ error: 'oops' });
      useFilmsStore.getState().clearError();
      expect(useFilmsStore.getState().error).toBeNull();
    });

    it('fetchCategories remplit categories', async () => {
      const cats = [{ id: 'c1', name: 'action' }];
      vi.mocked(categoriesAPI.getAll).mockResolvedValue({ categories: cats });

      await useFilmsStore.getState().fetchCategories();

      expect(useFilmsStore.getState().categories).toEqual(cats);
    });
  });

  describe('useAuthStore', () => {
    it('setUser et setToken synchronisent isAuthenticated', () => {
      useAuthStore.getState().setToken('tok');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().token).toBe('tok');

      useAuthStore.getState().setUser({
        id: 'u1',
        username: 'alice',
        email: 'a@b.co',
      });
      expect(useAuthStore.getState().user?.username).toBe('alice');

      useAuthStore.getState().setToken(null);
      useAuthStore.getState().setUser(null);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('login met à jour session quand la réponse est ok', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          token: 'jwt-1',
          user: { id: 'id1', username: 'bob', email: 'bob@ex.com' },
        }),
      });
      vi.stubGlobal('fetch', fetchMock);

      await useAuthStore.getState().login('bob@ex.com', 'secret');

      expect(fetchMock).toHaveBeenCalled();
      expect(useAuthStore.getState().token).toBe('jwt-1');
      expect(useAuthStore.getState().user?.email).toBe('bob@ex.com');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('login lève une erreur si la réponse n’est pas ok', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          json: async () => ({ error: 'Identifiants invalides' }),
        }),
      );

      await expect(
        useAuthStore.getState().login('x@y.z', 'bad'),
      ).rejects.toThrow('Identifiants invalides');
    });
  });
});
