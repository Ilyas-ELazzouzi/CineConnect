import { create } from 'zustand';

interface UIState {
  isSearchOpen: boolean;
  isMenuOpen: boolean;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  toggleSearch: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleMenu: () => void;
  openMenu: () => void;
  closeMenu: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSearchOpen: false,
  isMenuOpen: false,
  theme: 'dark',
  sidebarOpen: false,
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  openMenu: () => set({ isMenuOpen: true }),
  closeMenu: () => set({ isMenuOpen: false }),
  setTheme: (theme: 'light' | 'dark') => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
