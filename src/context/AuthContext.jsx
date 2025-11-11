import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Crear el Contexto (AQUÍ MISMO)
const AuthContext = createContext();

// 2. Crear el Proveedor (el "cerebro")
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userRol, setUserRol] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // 3. Revisar localStorage cuando la app carga
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRol = localStorage.getItem('userRol');
    if (storedToken && storedRol) {
      setToken(storedToken);
      setUserRol(storedRol);
      setIsAuthenticated(true);
    }
  }, []);

  // 4. Función para Iniciar Sesión
  const login = (newToken, newRol) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userRol', newRol);
    setToken(newToken);
    setUserRol(newRol);
    setIsAuthenticated(true);
  };

  // 5. Función para Cerrar Sesión
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRol');
    setToken(null);
    setUserRol(null);
    setIsAuthenticated(false);
    navigate('/login'); // Redirige al login al cerrar sesión
  };

  return (
    <AuthContext.Provider value={{ token, userRol, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 6. Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
  return useContext(AuthContext);
};