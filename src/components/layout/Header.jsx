import {
  Box, Flex, Image, Button, Spacer,
  Menu, MenuButton, MenuList, MenuItem, IconButton, Avatar,
  HStack, Icon // <-- Asegurar que Icon esté importado
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import logoBanner from '../../assets/logo-banner.jpg';
import { useAuth } from '../../context/AuthContext'; 
import { FaUserAlt, FaHome } from 'react-icons/fa';
import { FiLogIn, FiEye } from 'react-icons/fi';
import { ArrowBackIcon } from '@chakra-ui/icons'; // <-- Importar Icono de Flecha

const Header = () => {
  const { isAuthenticated, logout, userRol } = useAuth(); 
  const location = useLocation();
  const currentPath = location.pathname;
  const showAuthButtons = !['/login', '/register'].includes(currentPath);

  const getHomeLink = () => {
    switch (userRol) {
      case 'AD': return '/admin';
      case 'C': return '/cuidador';
      case 'V': return '/veterinario';
      default: return '/';
    }
  };
  
  // Condición de visibilidad: SOLO visible si el usuario es Adoptante y NO está en la página principal (/)
  const isAdoptanteAndNotHome = userRol === 'AP' && currentPath !== '/';


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
        
        <HStack spacing={4}>
            
            {/* --- ⬇️ NUEVO BOTÓN DE REGRESO A MASCOTAS ⬇️ --- */}
            {isAdoptanteAndNotHome && (
                <Button
                    as={Link}
                    to="/" // Vuelve a la lista principal de Pet Cards
                    leftIcon={<ArrowBackIcon />} 
                    size="sm"
                    variant="outline"
                    color="white"
                    borderColor="white"
                    _hover={{ 
                        bg: "brand.700", // Color de acento
                        borderColor: "brand.900"
                    }}
                >
                    Mascotas
                </Button>
            )}
            
            {/* --- SECCIÓN DE MENÚS/LOGIN --- */}
            {isAuthenticated ? (
                <HStack spacing={4}>
                    {/* Vista Adoptante (Admin only) */}
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
                            {userRol === 'AD' && (
                                <MenuItem as={Link} to="/admin" fontWeight="bold">
                                    Panel de Admin
                                </MenuItem>
                            )}
                            
                            {userRol === 'AP' && (
                                <>
                                    <MenuItem as={Link} to="/perfil">
                                        Mi Perfil
                                    </MenuItem>
                                    <MenuItem as={Link} to="/mis-solicitudes">
                                        Mis Solicitudes
                                    </MenuItem>
                                </>
                            )}

                            {userRol === 'V' && (
                                <MenuItem as={Link} to="/veterinario/perfil">
                                    Mi Perfil (Vet)
                                </MenuItem>
                            )}

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
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;