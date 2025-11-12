import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, userRol } = useAuth();

  // Si está logueado Y el rol es 'AD', muestra la página.
  if (isAuthenticated && userRol === 'AD') {
    return children;
  }

  // Si no, lo redirige a la página de inicio.
  return <Navigate to="/" replace />;
};

export default AdminRoute;