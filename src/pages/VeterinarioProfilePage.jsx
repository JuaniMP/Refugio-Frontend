import {
  Box, Heading, Text, VStack, Spinner, useToast,
  SimpleGrid, Stat, StatLabel, StatNumber, Button
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowBackIcon } from '@chakra-ui/icons';

const VeterinarioProfilePage = () => {
  const { token } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch('http://localhost:8181/api/veterinarios/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error('No se pudo cargar tu perfil de veterinario.');
        }
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        toast({ title: 'Error', description: error.message, status: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [token, toast]);

  if (isLoading) {
    return <Spinner size="xl" mx="auto" mt={10} />;
  }

  if (!profile) {
    return <Text color="red.500">Error: No se pudo cargar el perfil.</Text>;
  }

  const { empleado, especialidad, registroProfesional } = profile;
  const { nombre, cedula, telefono } = empleado;

  return (
    <Box maxW="container.md" mx="auto" p={5}>
      <VStack spacing={6} align="stretch">
        <Button 
          leftIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/veterinario')}
          alignSelf="flex-start"
          variant="ghost"
        >
          Volver al Panel
        </Button>

        <Box bg="brand.100" p={8} borderRadius="lg" shadow="md">
          <Heading as="h1" size="lg" color="brand.900" mb={6}>
            Mi Perfil de Veterinario
          </Heading>
          
          <SimpleGrid columns={2} spacing={6}>
            <Stat>
              <StatLabel>Nombre Completo</StatLabel>
              <StatNumber color="brand.900">{nombre}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Cédula</StatLabel>
              <StatNumber color="brand.900">{cedula}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Teléfono</StatLabel>
              <StatNumber color="brand.900">{telefono || '-'}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Registro Profesional</StatLabel>
              <StatNumber color="brand.900">{registroProfesional || '-'}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Especialidad</StatLabel>
              <StatNumber color="brand.900">{especialidad}</StatNumber>
            </Stat>
          </SimpleGrid>
        </Box>
      </VStack>
    </Box>
  );
};

export default VeterinarioProfilePage;