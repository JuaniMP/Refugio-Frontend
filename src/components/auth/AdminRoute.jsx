import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner, Box } from '@chakra-ui/react';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, userRol, isLoadingAuth } = useAuth();

  // Si la autenticación aún está cargando desde localStorage,
  // mostramos un spinner y no hacemos nada.
  if (isLoadingAuth) {
    return (
      <Box textAlign="center" mt={20}>
        <Spinner size="xl" />
      </Box>
    );
  }

  // Si terminó de cargar Y está logueado Y el rol es 'AD', muestra la página.
  if (isAuthenticated && userRol === 'AD') {
    return children;
  }

  // Si no, lo redirige a la página de inicio.
  return <Navigate to="/" replace />;
};

export default AdminRoute;