import {
  Box, Button, FormControl, FormLabel, Input, VStack, Heading, Text,
  useToast, HStack, PinInput, PinInputField
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const VerifyAccountPage = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Obtenemos el email que pasamos desde la página de registro
  const email = location.state?.email;

  // Si no hay email, no se puede verificar. Redirigir al inicio.
  useEffect(() => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'No se ha proporcionado un email para verificar.',
        status: 'error',
      });
      navigate('/');
    }
  }, [email, navigate, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      login: email,
      code: code
    };

    try {
      const response = await fetch('http://localhost:8181/api/usuarios/verify-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al verificar la cuenta.');
      }

      toast({
        title: '¡Cuenta Verificada!',
        description: 'Tu cuenta ha sido activada. Ahora puedes iniciar sesión.',
        status: 'success',
        duration: 5000,
      });
      
      navigate('/login'); // Redirigir al login

    } catch (error) {
      toast({
        title: 'Error de Verificación',
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
        Verifica tu Cuenta
      </Heading>
      <Text textAlign="center" mb={6}>
        Enviamos un código de 6 dígitos a <strong>{email}</strong>. Por favor, ingrésalo abajo.
      </Text>
      <form onSubmit={handleSubmit}>
        <VStack spacing={6}>
          <FormControl isRequired>
            <FormLabel htmlFor="code" textAlign="center">Código de Verificación</FormLabel>
            {/* Usamos PinInput para el código de 6 dígitos */}
            <HStack justify="center">
              <PinInput value={code} onChange={(value) => setCode(value)}>
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
              </PinInput>
            </HStack>
          </FormControl>
          <Button 
            type="submit" 
            bg="brand.800" 
            color="white" 
            size="lg" 
            width="full" 
            _hover={{ bg: 'brand.900' }}
            isLoading={isLoading}
            isDisabled={code.length < 6}
          >
            Verificar y Activar
          </Button>
        </VStack>
      </form>
      {/* TODO: Añadir un botón de "Reenviar código" */}
    </Box>
  );
};

export default VerifyAccountPage;