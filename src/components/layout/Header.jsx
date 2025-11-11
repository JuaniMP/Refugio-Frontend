import {
  Box, Flex, Image, Button, Spacer,
  Menu, MenuButton, MenuList, MenuItem, IconButton, Avatar
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import logoBanner from '../../assets/logo-banner.jpg';
import { useAuth } from '../../context/AuthContext'; 
import { FaUserAlt } from 'react-icons/fa';
import { FiLogIn } from 'react-icons/fi'; // <-- 1. Importado el icono de Login

const Header = () => {
  const { isAuthenticated, logout } = useAuth(); 

  return (
    <Box as="header" bg="brand.800" p={4} color="white"> {/* brand.800 es el azul claro */}
      <Flex align="center">
        <Box>
          <Link to="/">
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
            // --- VISTA SI ESTÁ LOGUEADO ---
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Opciones de perfil"
                icon={<Avatar bg="brand.900" size="sm" icon={<FaUserAlt fontSize="1rem" />} />} // Fondo café
                variant="outline"
                colorScheme="whiteAlpha"
                isRound
              />
              <MenuList color="brand.900">
                <MenuItem as={Link} to="/perfil">
                  Mi Perfil
                </MenuItem>
                <MenuItem onClick={logout}>
                  Cerrar Sesión
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            // --- VISTA SI NO ESTÁ LOGUEADO (MODIFICADA) ---
            <>
              {/* Botón "Iniciar Sesión" con el nuevo estilo blanco */}
              <Button 
                as={Link} 
                to="/login"
                bg="white" 
                color="brand.800" // Color del texto igual al fondo del header
                _hover={{ bg: 'whiteAlpha.800' }}
                leftIcon={<FiLogIn />} // Icono añadido
              >
                Iniciar Sesión
              </Button>
              
              {/* Botón "Registrarse" eliminado, según tu indicación */}
            </>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default Header;