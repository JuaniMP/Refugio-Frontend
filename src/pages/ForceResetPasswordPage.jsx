import {
  Box, Button, FormControl, FormLabel, Input, VStack, Heading, Text,
  useToast, Progress
} from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const ForceResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ value: 0, color: 'red' });
  const toast = useToast();
  const navigate = useNavigate();
  
  // --- 1. OBTENER EL ROL Y EL TOKEN ---
  const { token, userRol } = useAuth(); 

  const handlePasswordChange = (e) => {
    const pass = e.target.value;
    setPassword(pass);
    // Lógica del medidor
    let value = 0;
    let color = 'red';
    if (pass.length >= 8) value = 33;
    if (pass.length >= 8 && /[0-9]/.test(pass)) { value = 66; color = 'yellow'; }
    if (pass.length >= 8 && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) { value = 100; color = 'green'; }
    setPasswordStrength({ value, color });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: 'Las contraseñas no coinciden', status: 'error' });
      return;
    }
    
    setIsLoading(true);

    try {
      // Usamos el endpoint que ya existe en el backend
      const response = await fetch('http://localhost:8181/api/usuarios/force-reset-password', { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Usamos el token del login
        },
        body: JSON.stringify({ nuevaClave: password }),
      });

      const data = await response.json(); 

      if (!response.ok) {
        throw new Error(data.message || 'Error al restablecer la contraseña.');
      }

      toast({
        title: '¡Contraseña Actualizada!',
        description: 'Tu contraseña ha sido cambiada. Bienvenido.',
        status: 'success',
      });
      
      // --- 2. ⬇️ AQUÍ ESTÁ LA MODIFICACIÓN ⬇️ ---
      // Redirigir según el rol que ya tenemos guardado
      if (userRol === 'AD') {
        navigate('/admin');
      } else if (userRol === 'C') {
        navigate('/cuidador');
      } else if (userRol === 'V') {
        navigate('/veterinario'); // <-- AÑADIDO
      } else {
        navigate('/');
      }
      // --- 2. ⬆️ FIN DE LA MODIFICACIÓN ⬆️ ---

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
        Cambiar Contraseña
      </Heading>
      <Text textAlign="center" mb={6}>
        Por seguridad, debes cambiar tu contraseña temporal antes de continuar.
      </Text>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Nueva Contraseña</FormLabel>
            <Input 
              type="password" 
              value={password}
              onChange={handlePasswordChange} 
            />
            <Progress colorScheme={passwordStrength.color} size="xs" value={passwordStrength.value} mt={2} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Confirmar Nueva Contraseña</FormLabel>
            <Input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} 
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
            isDisabled={!password || !confirmPassword}
          >
            Guardar y Continuar
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default ForceResetPasswordPage;