import {
  Box, Heading, SimpleGrid, Spinner, Text, VStack,
  Stat, StatLabel, StatNumber, StatHelpText, StatGroup,
  Alert, AlertIcon
} from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
// 1. Importar la librería de gráficos que instalamos
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// 2. Registrar los componentes del gráfico
ChartJS.register(ArcElement, Tooltip, Legend);

const AdminEstadisticas = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    // Helper para no repetir el header del token
    const fetchWithAuth = (url) => 
      fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => {
          if (!res.ok) throw new Error(`Error ${res.status} al cargar ${url}`);
          return res.json();
        });

    try {
      // 3. Hacemos todas las llamadas a la API en paralelo
      const [mascotas, adoptantes, veterinarios, cuidadores, solicitudes] = await Promise.all([
        fetchWithAuth('http://localhost:8181/api/mascotas/getAll'),
        fetchWithAuth('http://localhost:8181/api/adoptantes/getAll'),
        fetchWithAuth('http://localhost:8181/api/veterinarios/getAll'),
        fetchWithAuth('http://localhost:8181/api/cuidadores/getAll'),
        fetchWithAuth('http://localhost:8181/api/solicitudes/getAll')
      ]);

      // 4. Procesamos los datos para las estadísticas
      const mascotasEnRefugio = mascotas.filter(m => m.estado === 'EN_REFUGIO').length;
      const mascotasAdoptadas = mascotas.filter(m => m.estado === 'ADOPTADA').length;
      const mascotasEnProceso = mascotas.filter(m => m.estado === 'EN_PROCESO_ADOPCION').length;
      const mascotasEnRecuperacion = mascotas.filter(m => m.estado === 'OTRO').length;
      
      const solicitudesPendientes = solicitudes.filter(s => s.estado === 'PENDIENTE').length;

      setStats({
        // Gráfico de Mascotas
        petData: {
          labels: ['Disponibles (En Refugio)', 'Adoptadas (Éxito)', 'En Proceso', 'En Recuperación (Otro)'],
          datasets: [{
            label: '# de Mascotas',
            data: [mascotasEnRefugio, mascotasAdoptadas, mascotasEnProceso, mascotasEnRecuperacion],
            backgroundColor: [
              'rgba(151, 206, 197, 0.7)', // brand.800 (Teal)
              'rgba(90, 154, 158, 0.7)', // brand.700 (Azul/Verde)
              'rgba(247, 184, 1, 0.7)',   // Amarillo (para Pendiente)
              'rgba(226, 83, 70, 0.7)',   // Rojo (para Recuperación)
            ],
            borderColor: [
              '#5B3A29', // brand.900 (Café)
            ],
            borderWidth: 1,
          }],
        },
        
        // Tarjetas de Estadísticas (Kards)
        kards: {
          totalAdoptantes: adoptantes.length,
          totalVeterinarios: veterinarios.length,
          totalCuidadores: cuidadores.length,
          solicitudesPendientes: solicitudesPendientes,
        }
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <Spinner size="xl" mx="auto" mt={10} />;
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Hubo un error al cargar las estadísticas: {error}
      </Alert>
    );
  }

  if (!stats) {
    return <Text>No hay datos para mostrar.</Text>;
  }

  return (
    <VStack spacing={8} align="stretch">
      
      {/* 1. Tarjetas (Kards) con los conteos principales */}
      <StatGroup>
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          <Stat p={4} bg="brand.100" borderRadius="lg" shadow="md">
            <StatLabel color="brand.900">Solicitudes Pendientes</StatLabel>
            <StatNumber fontSize="4xl" color="brand.800">
              {stats.kards.solicitudesPendientes}
            </StatNumber>
            <StatHelpText>Por aprobar o rechazar</StatHelpText>
          </Stat>
          
          <Stat p={4} bg="brand.100" borderRadius="lg" shadow="md">
            <StatLabel color="brand.900">Adoptantes Registrados</StatLabel>
            <StatNumber fontSize="4xl" color="brand.800">
              {stats.kards.totalAdoptantes}
            </StatNumber>
            <StatHelpText>Usuarios con rol 'AP'</StatHelpText>
          </Stat>

          <Stat p={4} bg="brand.100" borderRadius="lg" shadow="md">
            <StatLabel color="brand.900">Veterinarios Activos</StatLabel>
            <StatNumber fontSize="4xl" color="brand.800">
              {stats.kards.totalVeterinarios}
            </StatNumber>
            <StatHelpText>Personal médico</StatHelpText>
          </Stat>

          <Stat p={4} bg="brand.100" borderRadius="lg" shadow="md">
            <StatLabel color="brand.900">Cuidadores Asignados</StatLabel>
            <StatNumber fontSize="4xl" color="brand.800">
              {stats.kards.totalCuidadores}
            </StatNumber>
            <StatHelpText>Personal de refugio</StatHelpText>
          </Stat>
        </SimpleGrid>
      </StatGroup>

      {/* 2. Gráfico de Mascotas */}
      <Box bg="white" p={6} borderRadius="lg" shadow="md">
        <Heading size="md" color="brand.900" mb={4}>
          Estado General de Mascotas
        </Heading>
        <Box maxW="400px" mx="auto">
          <Doughnut data={stats.petData} />
        </Box>
      </Box>

    </VStack>
  );
};

export default AdminEstadisticas;