import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Spinner, // Para feedback de carga
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Importar useAuth

const ProfilePage = () => {
  const { token } = useAuth(); // Obtener el token del contexto
  const toast = useToast();
  
  // Estado para el adoptante completo
  const [adoptante, setAdoptante] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // --- Cargar Datos del Perfil ---
  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return; // No hacer nada si no hay token
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:8181/api/adoptantes/me', {
          headers: {
            'Authorization': `Bearer ${token}` // Enviar el token
          }
        });

        if (!response.ok) {
          throw new Error('No se pudo cargar tu perfil.');
        }
        
        const data = await response.json();
        setAdoptante(data); // Guardar el adoptante completo

      } catch (error) {
        toast({
          title: 'Error',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [token, toast]); // Depende de 'token' y 'toast'

  // --- Manejador para el formulario de edición ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si el campo es del usuario (ej. email), actualizar el objeto anidado
    if (name === 'email') {
      setAdoptante(prev => ({
        ...prev,
        usuario: {
          ...prev.usuario,
          login: value // 'login' es el email en el backend
        }
      }));
    } else {
      setAdoptante(prev => ({
        ...prev,
        [name]: value // Campos directos (nombre, direccion, etc.)
      }));
    }
  };

  // --- Guardar Cambios ---
  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8181/api/adoptantes/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Token también necesario para guardar
        },
        body: JSON.stringify(adoptante)
      });

      if (!response.ok) {
        throw new Error('Error al guardar los cambios.');
      }

      const data = await response.json();
      setAdoptante(data); // Actualizar el estado con los datos guardados
      setIsEditing(false);

      toast({
        title: 'Perfil Actualizado',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Spinner size="xl" mx="auto" mt={10} />;
  }

  if (!adoptante) {
    return <Text>No se encontraron datos del perfil.</Text>;
  }

  return (
    <Box maxW="lg" mx="auto" mt={10} p={8} bg="brand.100" borderRadius="md">
      <Heading as="h2" size="xl" mb={6} textAlign="center" color="brand.900">
        Mi Perfil
      </Heading>
      
      {isEditing ? (
        // --- VISTA DE EDICIÓN ---
        <VStack as="form" spacing={4} onSubmit={handleSave}>
          <FormControl isRequired>
            <FormLabel color="brand.800">Nombre Completo</FormLabel>
            <Input name="nombre" value={adoptante.nombre} onChange={handleChange} bg="white" />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="brand.800">Correo (Login)</FormLabel>
            <Input name="email" value={adoptante.usuario.login} onChange={handleChange} bg="white" />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="brand.800">Documento</FormLabel>
            <Input name="documento" value={adoptante.documento} onChange={handleChange} bg="white" />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="brand.800">Dirección</FormLabel>
            <Input name="direccion" value={adoptante.direccion} onChange={handleChange} bg="white" />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="brand.800">Teléfono</FormLabel>
            <Input name="telefono" value={adoptante.telefono} onChange={handleChange} bg="white" />
          </FormControl>
          
          <Button type="submit" bg="brand.800" color="white" size="lg" width="full" isLoading={isLoading}>
            Guardar Cambios
          </Button>
          <Button onClick={() => setIsEditing(false)} variant="ghost" width="full">
            Cancelar
          </Button>
        </VStack>
      ) : (
        // --- VISTA DE LECTURA ---
        <VStack spacing={4} align="start">
          <Box w="full">
            <Text fontWeight="bold" color="brand.800">Nombre:</Text>
            <Text fontSize="lg" color="brand.900">{adoptante.nombre}</Text>
          </Box>
          <Box w="full">
            <Text fontWeight="bold" color="brand.800">Correo (Login):</Text>
            <Text fontSize="lg" color="brand.900">{adoptante.usuario.login}</Text>
          </Box>
          <Box w="full">
            <Text fontWeight="bold" color="brand.800">Documento:</Text>
            <Text fontSize="lg" color="brand.900">{adoptante.documento}</Text>
          </Box>
          <Box w="full">
            <Text fontWeight="bold" color="brand.800">Dirección:</Text>
            <Text fontSize="lg" color="brand.900">{adoptante.direccion}</Text>
          </Box>
          <Box w="full">
            <Text fontWeight="bold" color="brand.800">Teléfono:</Text>
            <Text fontSize="lg" color="brand.900">{adoptante.telefono}</Text>
          </Box>
          
          <Button onClick={() => setIsEditing(true)} bg="brand.700" color="white" size="lg" width="full" mt={4}>
            Editar Perfil
          </Button>
        </VStack>
      )}
    </Box>
  );
};

export default ProfilePage;