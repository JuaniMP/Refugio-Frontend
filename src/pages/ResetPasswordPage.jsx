import {
  Box, Button, FormControl, FormLabel, Input, VStack, Heading, Text,
  useToast, HStack, PinInput, PinInputField,
  Progress // <-- 1. Importar el componente Progress
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ResetPasswordPage = () => {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // --- 2. Estado para el medidor de fuerza ---
  const [passwordStrength, setPasswordStrength] = useState({ value: 0, color: 'red' });
  
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'No se ha proporcionado un email.',
        status: 'error',
      });
      navigate('/olvide-contrasena');
    }
  }, [email, navigate, toast]);


  // --- 3. Función para calcular y actualizar la fuerza ---
  const handlePasswordStrengthChange = (e) => {
    const pass = e.target.value;
    setPassword(pass); // Actualizar el estado de la contraseña

    let value = 0;
    let color = 'red';

    // Lógica del medidor (copiada de RegisterPage)
    if (pass.length >= 8) {
      value = 33;
      color = 'red';
    }
    if (pass.length >= 8 && /[0-9]/.test(pass)) {
      value = 66;
      color = 'yellow';
    }
    if (pass.length >= 8 && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) {
      value = 100;
      color = 'green';
    }
    
    setPasswordStrength({ value, color });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: 'Las contraseñas no coinciden', status: 'error' });
      return;
    }
    
    setIsLoading(true);

    const payload = {
      login: email,
      code: code,
      nuevaClave: password
    };

    try {
      const response = await fetch('http://localhost:8181/api/usuarios/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json(); 

      if (!response.ok) {
        const errorMessage = data.message || "Error de validación desconocido. Intenta de nuevo.";

        toast({
            title: 'Error de Restablecimiento',
            description: errorMessage,
            status: 'error',
        });
        return; 
      }

      toast({
        title: '¡Contraseña Actualizada!',
        description: 'Tu contraseña ha sido cambiada. Ahora puedes iniciar sesión.',
        status: 'success',
      });
      
      navigate('/login');

    } catch (error) {
      toast({
        title: 'Error de Conexión',
        description: error.message || 'No se pudo conectar con el servidor.',
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box bg="brand.100" p={8} borderRadius="md" maxW="md" mx="auto" mt={10}>
      <Heading as="h2" size="xl" mb={4} textAlign="center" color="brand.900">
        Restablecer Contraseña
      </Heading>
      <Text textAlign="center" mb={6}>
        Ingresa el código que enviamos a <strong>{email}</strong> y tu nueva contraseña.
      </Text>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel htmlFor="code" textAlign="center">Código de Verificación</FormLabel>
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

          {/* --- 4. CAMPO NUEVA CONTRASEÑA CON MEDIDOR --- */}
          <FormControl isRequired>
            <FormLabel>Nueva Contraseña (mín. 8 caracteres)</FormLabel>
            <Input 
              type="password" 
              value={password}
              onChange={handlePasswordStrengthChange} // <-- Usamos el nuevo handler
            />
            {/* Medidor de contraseña */}
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
            isDisabled={code.length < 6 || !password || !confirmPassword}
          >
            Guardar Contraseña
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default ResetPasswordPage;