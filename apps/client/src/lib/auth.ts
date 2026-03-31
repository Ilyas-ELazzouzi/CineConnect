export const login = async (_email: string, _password: string) => {
  throw new Error('L\'authentification sera disponible en Phase 2 (après l\'intégration du backend)');
};

export const register = async (_username: string, _email: string, _password: string) => {
  throw new Error('L\'inscription sera disponible en Phase 2 (après l\'intégration du backend)');
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => {
  return false;
};
