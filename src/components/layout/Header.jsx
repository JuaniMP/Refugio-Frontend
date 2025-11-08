import { Box, Flex, Heading, Button, Spacer } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <Box as="header" bg="brand.800" p={4} color="white">
      <Flex align="center">
        <Heading as="h1" size="lg">
          <Link to="/">BigotesFelizes</Link>
        </Heading>
        <Spacer />
        <Box>
          <Button as={Link} to="/login" colorScheme="whiteAlpha" variant="outline" mr={4}>
            Iniciar Sesión
          </Button>
          <Button as={Link} to="/register" bg="brand.700" color="white" _hover={{ bg: 'brand.900' }}>
            Registrarse
          </Button>
        </Box>
      </Flex>
    </Box>
  );
};

export default Header;
