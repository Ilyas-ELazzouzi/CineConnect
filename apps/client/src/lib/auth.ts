// Utilitaires d'authentification
// Phase 1 : Ces fonctions sont des stubs (non fonctionnelles)
// Elles seront implémentées en Phase 2 avec le backend et JWT

/**
 * Tente de connecter un utilisateur
 * Phase 1 : Non implémenté, lance une erreur
 */
export const login = async (email: string, password: string) => {
  throw new Error('L\'authentification sera disponible en Phase 2 (après l\'intégration du backend)');
};

/**
 * Inscrit un nouvel utilisateur
 * Phase 1 : Non implémenté, lance une erreur
 */
export const register = async (username: string, email: string, password: string) => {
  throw new Error('L\'inscription sera disponible en Phase 2 (après l\'intégration du backend)');
};

/**
 * Déconnecte l'utilisateur actuel
 * Supprime le token et les données utilisateur du localStorage
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Récupère le token d'authentification depuis le localStorage
 * @returns Le token ou null si absent
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Récupère les données de l'utilisateur connecté
 * @returns L'objet utilisateur ou null si absent
 */
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Vérifie si un utilisateur est actuellement connecté
 * Phase 1 : Retourne toujours false
 * @returns true si connecté, false sinon
 */
export const isAuthenticated = () => {
  return false;
};
