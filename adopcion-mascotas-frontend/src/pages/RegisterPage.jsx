import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
} from '@chakra-ui/react';
import { useState } from 'react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos de registro:', formData);
  };

  return (
    <Box bg="brand.100" p={8} borderRadius="md" maxW="md" mx="auto" mt={10}>
      <Heading as="h2" size="xl" mb={6} textAlign="center" color="brand.900">
        Crear una Cuenta
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel color="brand.800">Nombre</FormLabel>
            <Input name="firstName" onChange={handleChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="brand.800">Apellido</FormLabel>
            <Input name="lastName" onChange={handleChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="brand.800">Correo Electrónico</FormLabel>
            <Input type="email" name="email" onChange={handleChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="brand.800">Contraseña</FormLabel>
            <Input type="password" name="password" onChange={handleChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="brand.800">Teléfono</FormLabel>
            <Input name="phone" onChange={handleChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="brand.800">Dirección</FormLabel>
            <Input name="address" onChange={handleChange} />
          </FormControl>
          <Button type="submit" bg="brand.800" color="white" size="lg" width="full" _hover={{ bg: 'brand.900' }}>
            Registrarse
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default RegisterPage;
