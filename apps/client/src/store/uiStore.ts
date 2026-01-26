// Store Zustand pour gérer l'état de l'interface utilisateur
// Contrôle les modales, menus, thème, etc.

import { create } from 'zustand';

// Interface définissant la structure du store UI
interface UIState {
  // État
  isSearchOpen: boolean; // Indique si la modale de recherche est ouverte
  isMenuOpen: boolean; // Indique si le menu mobile est ouvert
  theme: 'light' | 'dark'; // Thème actuel de l'application
  sidebarOpen: boolean; // Indique si la sidebar est ouverte

  // Actions
  toggleSearch: () => void; // Bascule l'état de la modale de recherche
  openSearch: () => void; // Ouvre la modale de recherche
  closeSearch: () => void; // Ferme la modale de recherche
  toggleMenu: () => void; // Bascule l'état du menu mobile
  openMenu: () => void; // Ouvre le menu mobile
  closeMenu: () => void; // Ferme le menu mobile
  setTheme: (theme: 'light' | 'dark') => void; // Change le thème
  toggleSidebar: () => void; // Bascule l'état de la sidebar
}

// Création du store avec état initial
export const useUIStore = create<UIState>((set) => ({
  // État initial
  isSearchOpen: false,
  isMenuOpen: false,
  theme: 'dark',
  sidebarOpen: false,

  // Actions pour gérer la modale de recherche
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),

  // Actions pour gérer le menu mobile
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  openMenu: () => set({ isMenuOpen: true }),
  closeMenu: () => set({ isMenuOpen: false }),

  // Action pour changer le thème
  setTheme: (theme: 'light' | 'dark') => set({ theme }),

  // Action pour gérer la sidebar
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
