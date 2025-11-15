import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner, Box } from '@chakra-ui/react';

const VeterinarioRoute = ({ children }) => {
  const { isAuthenticated, userRol, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <Box textAlign="center" mt={20}>
        <Spinner size="xl" />
      </Box>
    );
  }

  // Si está logueado Y el rol es 'V' (Veterinario), muestra la página.
  if (isAuthenticated && userRol === 'V') {
    return children;
  }

  // Si no, lo redirige a la página de inicio.
  return <Navigate to="/" replace />;
};

export default VeterinarioRoute;