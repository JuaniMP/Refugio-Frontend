import {
  Box, Button, FormControl, FormLabel, Input, VStack, Heading, Text,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8181/api/usuarios/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al solicitar el código.');
      }

      toast({
        title: 'Solicitud Enviada',
        description: 'Si el correo está registrado, recibirás un código.',
        status: 'success',
      });
      
      // Enviamos al usuario a la página de reseteo, pasando el email
      navigate('/resetear-contrasena', { state: { email: email } });

    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box bg="brand.100" p={8} borderRadius="md" maxW="md" mx="auto" mt={10}>
      <Heading as="h2" size="xl" mb={4} textAlign="center" color="brand.900">
        ¿Olvidaste tu Contraseña?
      </Heading>
      <Text textAlign="center" mb={6}>
        Ingresa tu correo electrónico y te enviaremos un código para restablecerla.
      </Text>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Correo Electrónico</FormLabel>
            <Input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="tu-correo@ejemplo.com"
            />
          </FormControl>
          <Button 
            type="submit" 
            bg="brand.800" 
            color="white" 
            size="lg" 
            width="full" 
            _hover={{ bg: 'brand.900' }}
            isLoading={isLoading}
          >
            Enviar Código
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default ForgotPasswordPage;