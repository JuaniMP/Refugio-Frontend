import { Box } from '@chakra-ui/react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    // 1. El Box principal ahora es un contenedor Flex vertical
    //    y tiene una altura mínima del 100% de la ventana (viewport height)
    <Box display="flex" flexDirection="column" minHeight="100vh">
      
      <Header />

      {/* 2. El contenido principal (main) ahora "crece" para
             ocupar todo el espacio disponible, empujando al footer */}
      <Box as="main" p={4} flex="1">
        {children}
      </Box>

      <Footer />

    </Box>
  );
};

export default Layout;