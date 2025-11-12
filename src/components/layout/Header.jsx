import {
  Box, Flex, Image, Button, Spacer,
  Menu, MenuButton, MenuList, MenuItem, IconButton, Avatar,
  HStack
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import logoBanner from '../../assets/logo-banner.jpg';
import { useAuth } from '../../context/AuthContext'; 
import { FaUserAlt } from 'react-icons/fa';
import { FiLogIn, FiEye } from 'react-icons/fi';

const Header = () => {
  const { isAuthenticated, logout, userRol } = useAuth(); 
  const location = useLocation();
  const currentPath = location.pathname;
  const showAuthButtons = !['/login', '/register'].includes(currentPath);

  return (
    <Box as="header" bg="brand.800" p={4} color="white">
      <Flex align="center">
        <Box>
          <Link to={userRol === 'AD' ? '/admin' : '/'}>
            <Image 
              src={logoBanner} 
              alt="Logo Bigotes Felizes" 
              maxH="60px"
              objectFit="contain"
            />
          </Link>
        </Box>
        <Spacer />
        <Box>
          {isAuthenticated ? (
            // --- VISTA LOGUEADO ---
            <HStack spacing={4}>
              
              {/* --- Botón "Vista Adoptante" (SOLO ADMIN) --- */}
              {userRol === 'AD' && (
                <Button 
                  as={Link}
                  to="/"
                  leftIcon={<FiEye />}
                  size="sm"
                  variant="outline"
                  // --- CAMBIO AQUÍ ---
                  color="brand.200" // Texto e Icono color CREMA
                  // --- FIN DEL CAMBIO ---
                  borderColor="brand.200" // Borde color CREMA
                  _hover={{ 
                    bg: "brand.200", // Fondo Crema al pasar el mouse
                    color: "brand.900" // Texto Café al pasar el mouse
                  }}
                >
                  Vista Adoptante
                </Button>
              )}
              
              <Menu>
                <MenuButton
                  as={IconButton}
                  aria-label="Opciones de perfil"
                  icon={<Avatar bg="brand.900" size="sm" icon={<FaUserAlt fontSize="1rem" />} />} 
                  variant="outline"
                  colorScheme="whiteAlpha"
                  isRound
                />
                
                <MenuList color="brand.900">
                  {userRol === 'AD' && (
                    <MenuItem as={Link} to="/admin" fontWeight="bold">
                      Panel de Admin
                    </MenuItem>
                  )}
                  
                  {userRol !== 'AD' && (
                     <MenuItem as={Link} to="/perfil">
                       Mi Perfil
                     </MenuItem>
                  )}

                  <MenuItem onClick={logout}>
                    Cerrar Sesión
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          ) : (
             // --- VISTA NO LOGUEADO ---
            showAuthButtons && (
              <Button 
                as={Link} 
                to="/login"
                bg="white" 
                color="brand.800" 
                _hover={{ bg: 'whiteAlpha.800' }}
                leftIcon={<FiLogIn />}
              >
                Iniciar Sesión
              </Button>
            )
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default Header;