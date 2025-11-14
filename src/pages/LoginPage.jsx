import {
  Box, Button, FormControl, FormLabel, Input, VStack, Heading, Text,
  Link as ChakraLink, useToast,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const toast = useToast();
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      login: email,
      clave: password,
    };

    try {
      const response = await fetch('http://localhost:8181/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        
        // --- 1. LÓGICA DE INTERCEPTACIÓN (CUENTAS DE EMPLEADO) ---
        if (data.error === 'FORCE_RESET') {
            toast({
                title: 'Cambio de contraseña requerido',
                description: 'Es tu primer inicio de sesión. Debes cambiar tu contraseña temporal.',
                status: 'info',
                duration: 7000,
            });
            // Guardamos el token (para estar autenticado) y redirigimos
            auth.login(data.token, data.rol); // Asumiendo que el backend envía token y rol
            navigate('/force-reset-password');
            return;
        }
        
        // --- 2. LÓGICA DE INTERCEPTACIÓN (CUENTAS DE ADOPTANTE) ---
        if (data.error === 'ACCOUNT_INACTIVE') {
          toast({
            title: 'Cuenta Inactiva',
            description: 'Tu cuenta está inactiva. Por favor, revisa tu email y verifica tu cuenta.',
            status: 'warning',
            duration: 7000,
          });
          navigate('/verificar-cuenta', { state: { email: email } });
          return;
        }
        // --- FIN DE LÓGICA ---
        
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // --- LOGIN NORMAL ---
      auth.login(data.token, data.rol);

      toast({
        title: 'Inicio de sesión exitoso',
        status: 'success',
      });

      if (data.rol === 'AD') {
        navigate('/admin');
      } else {
        navigate('/'); 
      }

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
      <Heading as="h2" size="xl" mb={6} textAlign="center" color="brand.900">
        Iniciar Sesión
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel color="brand.800">Correo Electrónico</FormLabel>
            <Input 
              type="email"
              name="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="brand.800">Contraseña</FormLabel>
            <Input 
              type="password" 
              name="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
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
        <ChakraLink as={Link} to="/olvide-contrasena" color="brand.800">
          ¿Olvidaste tu contraseña?
        </ChakraLink>
      </Text>
    </Box>
  );
};

export default LoginPage;