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

  // --- ⬇️ LÓGICA DE LINK DEL LOGO ACTUALIZADA ⬇️ ---
  const getHomeLink = () => {
    switch (userRol) {
      case 'AD': return '/admin';
      case 'C': return '/cuidador';
      case 'V': return '/veterinario';
      default: return '/';
    }
  };

  return (
    <Box as="header" bg="brand.800" p={4} color="white">
      <Flex align="center">
        <Box>
          <Link to={getHomeLink()}>
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
            <HStack spacing={4}>
              
              {userRol === 'AD' && currentPath.startsWith('/admin') && (
                <Button 
                  as={Link}
                  to="/"
                  leftIcon={<FiEye />}
                  size="sm"
                  variant="outline"
                  color="brand.200" 
                  borderColor="brand.200"
                  _hover={{ 
                    bg: "brand.200", 
                    color: "brand.900"
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
                  {/* Admin */}
                  {userRol === 'AD' && (
                    <MenuItem as={Link} to="/admin" fontWeight="bold">
                      Panel de Admin
                    </MenuItem>
                  )}
                  
                  {/* Adoptante */}
                  {userRol === 'AP' && (
                     <MenuItem as={Link} to="/perfil">
                       Mi Perfil
                     </MenuItem>
                  )}

                  {/* --- ⬇️ AÑADIR ENLACE DE PERFIL PARA VET ⬇️ --- */}
                  {userRol === 'V' && (
                     <MenuItem as={Link} to="/veterinario/perfil">
                       Mi Perfil (Vet)
                     </MenuItem>
                  )}
                  {/* (El cuidador 'C' no tiene link de perfil, lo cual es correcto) */}

                  <MenuItem onClick={logout}>
                    Cerrar Sesión
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          ) : (
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