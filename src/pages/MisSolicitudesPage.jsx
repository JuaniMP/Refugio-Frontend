import {
  Box, Heading, Text, VStack, Spinner, useToast,
  Table, Thead, Tbody, Tr, Th, Td, Badge,
  Button, HStack, Alert, AlertIcon, Link as ChakraLink
} from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const MisSolicitudesPage = () => {
  const { token, userRol } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  const [solicitudes, setSolicitudes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mapeo de colores para el estado
  const getStatusColor = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'orange';
      case 'APROBADA': return 'green';
      case 'RECHAZADA': return 'red';
      case 'CANCELADA': return 'gray';
      default: return 'gray';
    }
  };
  
  const formatFecha = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const fetchSolicitudes = useCallback(async () => {
    if (userRol !== 'AP') {
        navigate('/'); // Redirigir si no es adoptante
        return;
    }
    setIsLoading(true);
    try {
      // 1. Llama al nuevo endpoint: /solicitudes/by-adoptante/me
      const response = await fetch('http://localhost:8181/api/solicitudes/by-adoptante/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al cargar tus solicitudes.');
      
      let data = await response.json();
      setSolicitudes(data);

    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [token, userRol, navigate, toast]);

  useEffect(() => {
    if (token && userRol === 'AP') fetchSolicitudes();
  }, [token, userRol, fetchSolicitudes]);

  if (isLoading) {
    return <Spinner size="xl" mx="auto" mt={10} />;
  }

  return (
    <Box maxW="container.xl" mx="auto" p={5}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" color="brand.900">
          Mis Solicitudes de Adopción
        </Heading>
        
        <Button 
            onClick={() => navigate('/')} 
            alignSelf="flex-start" 
            bg="brand.800"
            color="white"
            _hover={{ bg: 'brand.900' }}
        >
            Ver Mascotas Disponibles
        </Button>

        {solicitudes.length === 0 ? (
          <Alert status='info' mt={4}>
            <AlertIcon />
            Aún no has enviado ninguna solicitud de adopción. ¡Anímate a buscar un amigo!
          </Alert>
        ) : (
          <Box overflowX="auto" bg="white" p={4} borderRadius="lg" shadow="md">
            <Table variant="striped">
              <Thead>
                <Tr>
                  <Th>ID Solicitud</Th>
                  <Th>Mascota</Th>
                  <Th>Raza</Th>
                  <Th>Fecha de Solicitud</Th>
                  <Th>Estado</Th>
                </Tr>
              </Thead>
              <Tbody>
                {solicitudes.map(s => (
                  <Tr key={s.idSolicitud}>
                    <Td>{s.idSolicitud}</Td>
                    <Td>{s.mascota?.nombre || 'N/A'}</Td>
                    <Td>{s.mascota?.raza?.nombre || 'N/A'}</Td>
                    <Td>{formatFecha(s.fechaSolicitud)}</Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(s.estado)}>{s.estado}</Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default MisSolicitudesPage;