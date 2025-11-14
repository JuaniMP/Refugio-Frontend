import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userRol, setUserRol] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // <-- 1. AÑADIR ESTADO DE CARGA
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRol = localStorage.getItem('userRol');
    
    if (storedToken && storedRol) {
      setToken(storedToken);
      setUserRol(storedRol);
      setIsAuthenticated(true);
    }
    setIsLoadingAuth(false); // <-- 2. TERMINAR LA CARGA
  }, []);

  const login = (newToken, newRol) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userRol', newRol);
    setToken(newToken);
    setUserRol(newRol);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRol');
    setToken(null);
    setUserRol(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ token, userRol, isAuthenticated, login, logout, isLoadingAuth }}> {/* <-- 3. PROVEER EL ESTADO */}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};