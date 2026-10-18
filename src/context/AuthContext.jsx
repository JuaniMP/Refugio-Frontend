import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userRol, setUserRol] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRol = localStorage.getItem('userRol');
    
    if (storedToken && storedRol) {
      setToken(storedToken);
      setUserRol(storedRol);
      setIsAuthenticated(true);
    }
    setIsLoadingAuth(false);
  }, []);

  const login = (newToken, newRol) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userRol', newRol);
    setToken(newToken);
    setUserRol(newRol);
    setIsAuthenticated(true);
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRol');
    setToken(null);
    setUserRol(null);
    setIsAuthenticated(false);
    navigate('/login');
  }, [navigate]);

  // Si la API responde 401 (token vencido o inválido) se cierra la sesión.
  // El login queda fuera: ahí un 401 solo significa credenciales incorrectas.
  useEffect(() => {
    const fetchOriginal = window.fetch;
    window.fetch = async (...args) => {
      const response = await fetchOriginal(...args);
      const url = String(args[0]?.url ?? args[0]);
      if (response.status === 401 && url.startsWith(API_URL) && !url.endsWith('/usuarios/login')
          && localStorage.getItem('token')) {
        logout();
      }
      return response;
    };
    return () => { window.fetch = fetchOriginal; };
  }, [logout]);

  return (
    <AuthContext.Provider value={{ token, userRol, isAuthenticated, login, logout, isLoadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};