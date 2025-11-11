import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  HStack, // Para los botones
  Text,
  Progress, // Para el medidor de contraseña
  FormErrorMessage, // Para errores de validación
} from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  // Estado para controlar el paso actual (1 o 2)
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    documento: '', 
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });
  
  // Estado para el medidor de contraseña
  const [passwordStrength, setPasswordStrength] = useState({ value: 0, color: 'red' });
  const [formErrors, setFormErrors] = useState({}); // Estado para errores
  
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  // --- Manejador de cambio genérico ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Limpiar error de ese campo si el usuario empieza a escribir
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // --- Función para el medidor de contraseña ---
  const handlePasswordChange = (e) => {
    handleChange(e); // Llama al manejador normal
    const pass = e.target.value;
    let value = 0;
    let color = 'red';

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

  // --- Validación del Paso 1 ---
  const handleNextStep = () => {
    const errors = {};
    if (!formData.firstName) errors.firstName = 'El nombre es obligatorio.';
    if (!formData.lastName) errors.lastName = 'El apellido es obligatorio.';
    if (!formData.documento) errors.documento = 'El documento es obligatorio.';
    if (!formData.phone) errors.phone = 'El teléfono es obligatorio.';
    if (!formData.address) errors.address = 'La dirección es obligatoria.';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast({ status: 'error', title: 'Campos incompletos' });
    } else {
      setFormErrors({});
      setStep(2); // Avanza al siguiente paso
    }
  };

  // --- Envío final (Paso 2) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos del Paso 2
    const errors = {};
    if (!formData.email) errors.email = 'El correo es obligatorio.';
    if (formData.password.length < 8) errors.password = 'La contraseña debe tener al menos 8 caracteres.';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden.';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);

    const payload = {
      nombre: `${formData.firstName} ${formData.lastName}`,
      documento: formData.documento,
      direccion: formData.address,
      telefono: formData.phone,
      usuario: {
        login: formData.email,
        passwordHash: formData.password,
      },
    };

    try {
      const response = await fetch('http://localhost:8181/api/adoptantes/save', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Esto captura el error "El correo ya está registrado" del backend
        throw new Error(errorData.message || 'Error al registrar la cuenta.');
      }

      toast({
        title: 'Cuenta Creada',
        description: 'Tu cuenta de adoptante ha sido creada.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      navigate('/login');

    } catch (error) {
      toast({
        title: 'Error en el Registro',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box bg="brand.100" p={8} borderRadius="md" maxW="md" mx="auto" mt={10}>
      <Heading as="h2" size="xl" mb={6} textAlign="center" color="brand.900">
        Crear una Cuenta
      </Heading>
      
      {/* El 'onSubmit' va en el formulario principal */}
      <form onSubmit={handleSubmit}>
      
        {/* --- PASO 1: DATOS PERSONALES --- */}
        {step === 1 && (
          <VStack spacing={4}>
            <Heading as="h3" size="md" color="brand.800">Paso 1: Tus Datos</Heading>
            
            <FormControl isRequired isInvalid={formErrors.firstName}>
              <FormLabel color="brand.800">Nombre</FormLabel>
              <Input name="firstName" value={formData.firstName} onChange={handleChange} />
              <FormErrorMessage>{formErrors.firstName}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={formErrors.lastName}>
              <FormLabel color="brand.800">Apellido</FormLabel>
              <Input name="lastName" value={formData.lastName} onChange={handleChange} />
              <FormErrorMessage>{formErrors.lastName}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={formErrors.documento}>
              <FormLabel color="brand.800">Documento (Cédula)</FormLabel>
              <Input name="documento" value={formData.documento} onChange={handleChange} />
              <FormErrorMessage>{formErrors.documento}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={formErrors.phone}>
              <FormLabel color="brand.800">Teléfono</FormLabel>
              <Input name="phone" value={formData.phone} onChange={handleChange} />
              <FormErrorMessage>{formErrors.phone}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={formErrors.address}>
              <FormLabel color="brand.800">Dirección</FormLabel>
              <Input name="address" value={formData.address} onChange={handleChange} />
              <FormErrorMessage>{formErrors.address}</FormErrorMessage>
            </FormControl>
            
            <Button 
              onClick={handleNextStep}
              bg="brand.700" // Botón naranja
              color="white" 
              size="lg" 
              width="full" 
              _hover={{ bg: 'brand.900' }}
            >
              Siguiente
            </Button>
          </VStack>
        )}

        {/* --- PASO 2: DATOS DE CUENTA --- */}
        {step === 2 && (
          <VStack spacing={4}>
            <Heading as="h3" size="md" color="brand.800">Paso 2: Datos de Acceso</Heading>

            <FormControl isRequired isInvalid={formErrors.email}>
              <FormLabel color="brand.800">Correo Electrónico</FormLabel>
              <Input type="email" name="email" value={formData.email} onChange={handleChange} />
              <FormErrorMessage>{formErrors.email}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={formErrors.password}>
              <FormLabel color="brand.800">Contraseña (mín. 8 caracteres)</FormLabel>
              <Input type="password" name="password" value={formData.password} onChange={handlePasswordChange} />
              {/* Medidor de contraseña */}
              <Progress colorScheme={passwordStrength.color} size="xs" value={passwordStrength.value} mt={2} />
              <FormErrorMessage>{formErrors.password}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={formErrors.confirmPassword}>
              <FormLabel color="brand.800">Confirmar Contraseña</FormLabel>
              <Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
              <FormErrorMessage>{formErrors.confirmPassword}</FormErrorMessage>
            </FormControl>

            <HStack width="full">
              <Button 
                onClick={() => setStep(1)} // Botón para volver
                colorScheme="gray"
                variant="outline"
                size="lg" 
                width="full"
              >
                Atrás
              </Button>
              <Button 
                type="submit" // Botón final de envío
                bg="brand.800" 
                color="white" 
                size="lg" 
                width="full" 
                _hover={{ bg: 'brand.900' }}
                isLoading={isLoading}
              >
                Registrarse
              </Button>
            </HStack>
          </VStack>
        )}
        
      </form>
    </Box>
  );
};

export default RegisterPage;