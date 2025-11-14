import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner, Box } from '@chakra-ui/react'; // <-- Importar Spinner

const AdminRoute = ({ children }) => {
  const { isAuthenticated, userRol, isLoadingAuth } = useAuth(); // <-- 1. OBTENER isLoadingAuth

  // --- 2. LÓGICA DE CARGA ---
  // Si la autenticación aún está cargando desde localStorage,
  // mostramos un spinner y no hacemos nada.
  if (isLoadingAuth) {
    return (
      <Box textAlign="center" mt={20}>
        <Spinner size="xl" />
      </Box>
    );
  }
  // --- FIN LÓGICA DE CARGA ---

  // Si terminó de cargar Y está logueado Y el rol es 'AD', muestra la página.
  if (isAuthenticated && userRol === 'AD') {
    return children;
  }

  // Si no, lo redirige a la página de inicio.
  return <Navigate to="/" replace />;
};

export default AdminRoute;