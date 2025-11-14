import {
  Box, Heading, Text, VStack, Spinner, useToast,
  SimpleGrid, Stat, StatLabel, StatNumber, Textarea, FormControl, FormLabel,
  Table, Thead, Tbody, Tr, Th, Td, Image, Badge, Button,
  Alert, AlertIcon, AlertTitle, AlertDescription,
  HStack // <-- Import que faltaba
} from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

// --- (Helpers de formatEdad y getStatusColor) ---

const getStatusColor = (estado) => {
    switch (estado) {
        case 'EN_REFUGIO': return 'green';
        case 'EN_PROCESO_ADOPCION': return 'orange';
        case 'ADOPTADA': return 'blue';
        case 'OTRO': return 'red';
        default: return 'gray';
    }
};

const CuidadorDashboardPage = () => {
  const { token } = useAuth();
  const toast = useToast();
  
  const [profile, setProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  const [turnoActivo, setTurnoActivo] = useState(false);
  const [mascotasAsignadas, setMascotasAsignadas] = useState([]);
  const [isLoadingTurno, setIsLoadingTurno] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  
  const [comentarios, setComentarios] = useState({});

  // --- HELPER PARA BUSCAR MASCOTAS (NECESARIO) ---
  const fetchMascotasParaTurno = useCallback(async (zona) => {
      if (!zona) return []; // No buscar si no hay zona
      const headers = { 'Authorization': `Bearer ${token}` };
      const petsResponse = await fetch(
        `http://localhost:8181/api/mascotas/by-zona?zona=${encodeURIComponent(zona)}`, 
        { headers }
      );
      if (!petsResponse.ok) {
           toast({ title: 'Error', description: 'No se pudieron cargar las mascotas de tu zona.', status: 'error' });
           return [];
      }
      return await petsResponse.json();
  }, [token, toast]);
  
  // --- FUNCIÓN PARA CARGAR DATOS (SOLO SE EJECUTA 1 VEZ) ---
  useEffect(() => {
    const fetchPageData = async () => {
      if (!token) {
        setIsLoadingProfile(false);
        setIsLoadingTurno(false);
        return;
      }
      try {
        // Fetch 1: Perfil
        const profileResponse = await fetch('http://localhost:8181/api/cuidadores/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!profileResponse.ok) throw new Error('No se pudo cargar tu perfil.');
        const profileData = await profileResponse.json();
        setProfile(profileData);
        setIsLoadingProfile(false);

        // Fetch 2: Turno Activo
        const turnoResponse = await fetch('http://localhost:8181/api/asignaciones/mi-turno-activo', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!turnoResponse.ok) throw new Error('No se pudo verificar tu turno.');
        const asignacionesActivas = await turnoResponse.json();
        
        if (asignacionesActivas && asignacionesActivas.length > 0) {
          setTurnoActivo(true);
          const mascotasFull = await fetchMascotasParaTurno(profileData.zonaAsignada);
          const idMascotasActivas = new Set(asignacionesActivas.map(a => a.idMascota));
          setMascotasAsignadas(mascotasFull.filter(m => idMascotasActivas.has(m.idMascota)));
          
          const comentariosGuardados = {};
          asignacionesActivas.forEach(asig => {
            comentariosGuardados[asig.idMascota] = asig.comentarios || '';
          });
          setComentarios(comentariosGuardados);
        } else {
          setTurnoActivo(false);
          setMascotasAsignadas([]);
        }
      } catch (error) {
        toast({ title: 'Error al cargar datos', description: error.message, status: 'error' });
        setIsLoadingProfile(false);
      } finally {
        setIsLoadingTurno(false);
      }
    };

    fetchPageData();
  }, [token, toast, fetchMascotasParaTurno]); // <--- Dependencias correctas
  

  // --- HANDLER: COMENZAR TURNO (CORREGIDO) ---
  const handleComenzarTurno = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:8181/api/asignaciones/comenzar-turno', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json(); // 'data' es la lista de asignaciones
      
      if (!response.ok) throw new Error(data.message || 'Error al iniciar turno.');

      toast({ title: "Turno Iniciado", description: `Se te asignaron ${data.length} mascotas.`, status: 'success' });
      
      // --- ACTUALIZACIÓN DE ESTADO (SIN RECARGAR) ---
      setTurnoActivo(true);
      const mascotasFull = await fetchMascotasParaTurno(profile.zonaAsignada);
      const idMascotasActivas = new Set(data.map(a => a.idMascota));
      setMascotasAsignadas(mascotasFull.filter(m => idMascotasActivas.has(m.idMascota)));
      setComentarios({}); // Limpiar comentarios
      
    } catch (error) {
       toast({ title: 'Error', description: error.message, status: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // --- HANDLER: TERMINAR TURNO (CORREGIDO) ---
  const handleTerminarTurno = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:8181/api/asignaciones/terminar-turno', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Error al terminar turno.');

      toast({ title: "Turno Terminado", status: 'success' });
      
      // --- ACTUALIZACIÓN DE ESTADO (SIN RECARGAR) ---
      setTurnoActivo(false);
      setMascotasAsignadas([]);
      setComentarios({}); 

    } catch (error) {
       toast({ title: 'Error', description: error.message, status: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HANDLER: GUARDAR COMENTARIO (Al desenfocar) ---
  const handleComentarioChange = (idMascota, texto) => {
    setComentarios(prev => ({
      ...prev,
      [idMascota]: texto
    }));
  };
  
  const handleComentarioBlur = async (idMascota, texto) => {
    try {
      const response = await fetch('http://localhost:8181/api/asignaciones/guardar-comentario', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idMascota: parseInt(idMascota), comentarios: texto })
      });
      if (!response.ok) throw new Error("No se pudo guardar");
      
      toast({ description: "Comentario guardado.", status: 'success', duration: 1500, isClosable: true, position: 'bottom-right' });
      
    } catch (error) {
      toast({ title: `Error guardando nota`, description: error.message, status: 'error', duration: 2000 });
    }
  };

  // --- RENDER ---

  if (isLoadingProfile) {
    return <Spinner size="xl" mx="auto" mt={10} />;
  }

  if (!profile) {
    return <Text color="red.500">Error: No se pudo cargar el perfil del cuidador.</Text>;
  }

  const { empleado, turno, zonaAsignada } = profile;
  const { nombre, cedula } = empleado;

  return (
    <Box maxW="container.lg" mx="auto" p={5}>
      <VStack spacing={8} align="stretch">
        
        <Box bg="brand.100" p={6} borderRadius="lg" shadow="md">
          <HStack justify="space-between" align="flex-start">
            <VStack align="flex-start">
              <Heading as="h1" size="lg" color="brand.900" mb={4}>
                ¡Hola, {nombre.split(' ')[0]}!
              </Heading>
              <Text fontSize="lg" color="brand.800">Este es tu panel de control de cuidador.</Text>
            </VStack>
            
            {isLoadingTurno ? (
              <Spinner />
            ) : turnoActivo ? (
              <Button 
                colorScheme="red" 
                size="lg"
                onClick={handleTerminarTurno}
                isLoading={isSubmitting}
              >
                Terminar Turno
              </Button>
            ) : (
              <Button 
                colorScheme="green" 
                size="lg"
                onClick={handleComenzarTurno}
                isLoading={isSubmitting}
              >
                Comenzar Turno
              </Button>
            )}
          </HStack>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mt={6}>
            <Stat bg="white" p={4} borderRadius="md" shadow="sm">
              <StatLabel>Tu Cédula</StatLabel>
              <StatNumber color="brand.900">{cedula}</StatNumber>
            </Stat>
            <Stat bg="white" p={4} borderRadius="md" shadow="sm">
              <StatLabel>Turno Asignado</StatLabel>
              <StatNumber color="brand.9NORMAL">{turno}</StatNumber>
            </Stat>
            <Stat bg="white" p={4} borderRadius="md" shadow="sm">
              <StatLabel>Zona Asignada</StatLabel>
              <StatNumber color="brand.900">{zonaAsignada}</StatNumber>
            </Stat>
          </SimpleGrid>
        </Box>

        <Box bg="white" p={6} borderRadius="lg" shadow="md">
           <Heading as="h2" size="md" color="brand.900" mb={4}>
            Mascotas y Bitácora
          </Heading>
          
          {isLoadingTurno ? (
            <Spinner />
          ) : !turnoActivo ? (
            <Alert status="info">
              <AlertIcon />
              <AlertTitle>No has iniciado turno.</AlertTitle>
              <AlertDescription>
                Presiona "Comenzar Turno" para ver las mascotas de tu zona y activar la bitácora.
              </AlertDescription>
            </Alert>
          ) : mascotasAsignadas.length === 0 ? (
            <Alert status="warning">
              <AlertIcon />
              <AlertTitle>Turno activo sin mascotas.</AlertTitle>
              <AlertDescription>
                Iniciaste tu turno, pero actualmente no hay mascotas EN REFUGIO en tu zona ({zonaAsignada}).
              </AlertDescription>
            </Alert>
          ) : (
            <Box overflowX="auto">
              {/* 3. CORRECCIÓN DEL WARNING DE WHITESPACE */}
              {/* Moví la Tbody para que esté pegada a Thead y Table */}
              <Table variant="simple"><Thead>
                  <Tr>
                    <Th>Mascota</Th>
                    <Th>Detalles</Th>
                    <Th>Estado</Th>
                    <Th>Comentarios de Turno (Se guardan al desenfocar)</Th>
                  </Tr>
                </Thead><Tbody>
                  {mascotasAsignadas.map(m => (
                    <Tr key={m.idMascota}>
                      <Td>
                        <Image 
                          src={m.img || '/images/pets/default.png'} 
                          alt={m.nombre} 
                          boxSize="60px" 
                          objectFit="cover" 
                          borderRadius="md" 
                        />
                      </Td>
                      <Td>
                        <Text fontWeight="bold">{m.nombre}</Text>
                        <Text fontSize="sm">{m.raza?.nombre || 'N/A'}</Text>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(m.estado)}>
                          {m.estado}
                        </Badge>
                      </Td>
                      <Td>
                        <Textarea 
                          placeholder="Anotaciones sobre alimentos, salud, comportamiento..."
                          value={comentarios[m.idMascota] || ''}
                          onChange={(e) => handleComentarioChange(m.idMascota, e.target.value)}
                          onBlur={(e) => handleComentarioBlur(m.idMascota, e.target.value)}
                          rows={2}
                          isDisabled={isSubmitting} 
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody></Table>
            </Box>
          )}
        </Box>
        
      </VStack>
    </Box>
  );
};

export default CuidadorDashboardPage;