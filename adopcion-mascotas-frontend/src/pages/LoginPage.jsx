import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos de login:', formData);
  };

  return (
    <Box bg="brand.100" p={8} borderRadius="md" maxW="md" mx="auto" mt={10}>
      <Heading as="h2" size="xl" mb={6} textAlign="center" color="brand.900">
        Iniciar Sesión
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel color="brand.800">Correo Electrónico</FormLabel>
            <Input name="email" onChange={handleChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="brand.800">Contraseña</FormLabel>
            <Input type="password" name="password" onChange={handleChange} />
          </FormControl>
          <Button type="submit" bg="brand.800" color="white" size="lg" width="full" _hover={{ bg: 'brand.900' }}>
            Iniciar Sesión
          </Button>
        </VStack>
      </form>
      <Text mt={4} textAlign="center">
        ¿No tienes cuenta?{' '}
        <ChakraLink as={Link} to="/register" color="brand.800" fontWeight="bold">
          Regístrate aquí
        </ChakraLink>
      </Text>
      <Text mt={2} textAlign="center">
        <ChakraLink color="brand.800" href="#">
          ¿Olvidaste tu contraseña?
        </ChakraLink>
      </Text>
    </Box>
  );
};

export default LoginPage;
