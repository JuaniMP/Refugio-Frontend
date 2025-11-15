import {
  Box, Heading, Text, VStack, Spinner, useToast,
  InputGroup, InputLeftElement, Input, Button, Icon,
  SimpleGrid, Grid, GridItem,
  Tabs, TabList, Tab, TabPanels, TabPanel,
  FormControl, FormLabel, Textarea, Select, Badge,
  Table, Thead, Tbody, Tr, Th, Td,
  HStack,
  Image
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaSyringe, FaNotesMedical, FaSave } from 'react-icons/fa';

// --- 1. LISTA DE ESTADOS DE SALUD DISPONIBLES ---
const estadoSaludOptions = [
  'Estable', 
  'Observación', 
  'Crónico', 
  'Grave', 
  'Requiere Cirugía', 
  'Tratamiento',
  'Pendiente'
];

// Helper de formato de fecha
const formatFecha = (isoString) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleString('es-CO', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const VeterinarioDashboardPage = () => {
  const { token } = useAuth();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [petId, setPetId] = useState('');
  const [currentPet, setCurrentPet] = useState(null);
  
  const [historial, setHistorial] = useState(null);
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [vacunas, setVacunas] = useState([]);
  const [vacunaCatalog, setVacunaCatalog] = useState([]);
  
  const [allPets, setAllPets] = useState([]);
  const [isLoadingPets, setIsLoadingPets] = useState(true);

  // El estado inicial debe ser una de las opciones o vacío
  const [diagForm, setDiagForm] = useState({ diagnostico: '', tratamiento: '', observaciones: '', estadoSalud: '' });
  const [vacForm, setVacForm] = useState({ idVacuna: '', observaciones: '' });
  const [historialNotes, setHistorialNotes] = useState('');
  
  // Carga inicial (Catálogo y lista de mascotas)
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setIsLoadingPets(false);
        return;
      }
      setIsLoadingPets(true);
      try {
        const catRes = await fetch('http://localhost:8181/api/vacunas/getAll', {
           headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!catRes.ok) throw new Error('No se pudo cargar el catálogo de vacunas.');
        
        const catalogData = await catRes.json();
        const vacunasActivas = catalogData.filter(v => v.estado === 'ACTIVO');
        setVacunaCatalog(vacunasActivas);
        
        const petsRes = await fetch('http://localhost:8181/api/mascotas/getAll', {
           headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!petsRes.ok) throw new Error('No se pudo cargar la lista de mascotas.');
        const allPetsData = await petsRes.json();
        
        const petsEnRefugio = allPetsData.filter(
          p => p.estado === 'EN_REFUGIO' || p.estado === 'OTRO'
        );
        setAllPets(petsEnRefugio);

      } catch (error) {
        toast({ title: 'Error', description: error.message, status: 'error' });
      } finally {
        setIsLoadingPets(false);
      }
    };
    
    fetchData();
  }, [token, toast]);

  // --- FUNCIÓN DE BÚSQUEDA ---
  const handleSearchPet = async () => {
    if (!petId) return;
    setIsLoading(true);
    setCurrentPet(null); 
    setHistorial(null);
    setDiagnosticos([]);
    setVacunas([]);
    setHistorialNotes(''); 
    setDiagForm(prev => ({ ...prev, estadoSalud: '' })); // Resetear estadoSalud

    try {
      const petRes = await fetch(`http://localhost:8181/api/mascotas/secure-search/${petId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const petData = await petRes.json();
      if (!petRes.ok) throw new Error(petData.message || 'Error al buscar mascota.');
      setCurrentPet(petData);

      const histRes = await fetch(`http://localhost:8181/api/historiales/by-mascota/${petId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!histRes.ok) throw new Error('No se pudo cargar el historial.');
      const histData = await histRes.json();
      setHistorial(histData);
      setHistorialNotes(histData.notas || ''); 

      if (histData && histData.idHistorial) {
        const [diagRes, vacRes] = await Promise.all([
          fetch(`http://localhost:8181/api/diagnosticos/by-historial/${histData.idHistorial}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`http://localhost:8181/api/aplicaciones-vacuna/by-historial/${histData.idHistorial}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        setDiagnosticos(await diagRes.json());
        setVacunas(await vacRes.json());
      }
      
    } catch (error) {
      toast({ title: 'Error de Búsqueda', description: error.message, status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLERS DE FORMULARIOS ---
  const handleDiagFormChange = (e) => {
    const { name, value } = e.target;
    setDiagForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleVacFormChange = (e) => {
    const { name, value } = e.target;
    setVacForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveHistorialNotes = async () => {
    if (!historial) return;
    setIsSubmitting(true);
    try {
      const payload = {
        ...historial, 
        notas: historialNotes, 
      };
      
      const res = await fetch(`http://localhost:8181/api/historiales/save`, {
         method: 'POST',
         headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
         body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Error al guardar notas del historial.");
      
      const data = await res.json();
      setHistorial(data);
      toast({ title: 'Notas de Historial Guardadas', status: 'success' });

    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDiagnostico = async (e) => {
    e.preventDefault();
    if (!diagForm.diagnostico) {
      toast({ title: 'El campo "Diagnóstico" es obligatorio', status: 'warning' });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...diagForm,
        historial: { idHistorial: historial.idHistorial },
      };
      const res = await fetch(`http://localhost:8181/api/diagnosticos/save`, {
         method: 'POST',
         headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
         body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al guardar diagnóstico");
      setDiagnosticos(prev => [data, ...prev]); 
      setDiagForm({ diagnostico: '', tratamiento: '', observaciones: '', estadoSalud: '' });
      toast({ title: 'Diagnóstico Guardado', status: 'success' });
    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitVacuna = async (e) => {
     e.preventDefault();
     if (!vacForm.idVacuna) {
      toast({ title: 'Debe seleccionar una vacuna', status: 'warning' });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...vacForm,
        historial: { idHistorial: historial.idHistorial },
        vacuna: { idVacuna: parseInt(vacForm.idVacuna) }
      };
      const res = await fetch(`http://localhost:8181/api/aplicaciones-vacuna/save`, {
         method: 'POST',
         headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
         body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al aplicar vacuna");
      setVacunas(prev => [data, ...prev]); 
      setVacForm({ idVacuna: '', observaciones: '' }); 
      toast({ title: 'Vacuna Aplicada', status: 'success' });
    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Box maxW="container.xl" mx="auto" p={5}>
      <VStack spacing={6} align="stretch">
        
        <Heading as="h1" size="lg" color="brand.900">
          Panel de Diagnóstico Veterinario
        </Heading>
        
        <HStack as="form" onSubmit={(e) => { e.preventDefault(); handleSearchPet(); }}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input 
              type="number"
              placeholder="Buscar Mascota por ID..." 
              value={petId}
              onChange={(e) => setPetId(e.target.value)}
            />
          </InputGroup>
          <Button type="submit" bg="brand.800" color="white" _hover={{ bg: 'brand.900' }} isLoading={isLoading}>
            Buscar
          </Button>
        </HStack>

        {/* --- LISTA DE MASCOTAS (SOLO SI NO HAY BÚSQUEDA) --- */}
        {!currentPet && (
          <Box w="100%" p={5} borderRadius="md" borderWidth="1px" borderColor="gray.200">
            <Heading size="sm" color="brand.900" mb={4}>Mascotas en el Refugio (Haz clic para copiar ID)</Heading>
            {isLoadingPets ? (
              <Spinner />
            ) : (
              <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={4}>
                {allPets.map(pet => (
                  <VStack
                    key={pet.idMascota}
                    bg="white"
                    p={2}
                    borderRadius="md"
                    shadow="sm"
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{ shadow: 'md', transform: 'scale(1.05)' }}
                    onClick={() => {
                      setPetId(pet.idMascota.toString());
                      toast({
                        title: `ID ${pet.idMascota} copiado al buscador.`,
                        description: `Presiona "Buscar" para cargar a ${pet.nombre}.`,
                        status: 'info',
                        duration: 3000,
                        isClosable: true
                      });
                    }}
                  >
                    <Image
                      src={pet.img || '/images/pets/default.png'}
                      alt={pet.nombre}
                      boxSize="100px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                    <Text fontWeight="bold" fontSize="sm">{pet.nombre}</Text>
                    <Text fontSize="xs" color="gray.500">ID: {pet.idMascota}</Text>
                  </VStack>
                ))}
              </SimpleGrid>
            )}
            {allPets.length === 0 && !isLoadingPets && (
              <Text color="gray.500">No hay mascotas en el refugio en este momento.</Text>
            )}
          </Box>
        )}

        {/* --- MENSAJE DE ESPERA --- */}
        {!currentPet && !isLoading && (
          <Text color="gray.500" p={5} bg="gray.50" borderRadius="md" textAlign="center">
            Ingresa el ID de una mascota (o haz clic en una de la lista de arriba) para ver su historial médico.
          </Text>
        )}
        
        {isLoading && <Spinner size="xl" mx="auto" />}
        
        {/* --- RESULTADOS --- */}
        {currentPet && !isLoading && (
          <VStack spacing={6} align="stretch">
            
            {/* Info de la Mascota seleccionada (Cabecera) */}
            <Box bg="brand.100" p={5} borderRadius="lg" shadow="md" alignSelf="flex-start" w="100%">
              <HStack spacing={4} align="center">
                <Image
                  src={currentPet.img || '/images/pets/default.png'}
                  alt={currentPet.nombre}
                  boxSize="80px"
                  objectFit="cover"
                  borderRadius="full"
                />
                <VStack align="flex-start" spacing={0}>
                  <Heading size="md" color="brand.900">{currentPet.nombre}</Heading>
                  <Text fontSize="lg" color="brand.800">{currentPet.raza.nombre} ({currentPet.raza.especie.nombre})</Text>
                  <Badge colorScheme={currentPet.estado === 'ADOPTADA' ? 'blue' : 'green'} mt={1}>
                    {currentPet.estado}
                  </Badge>
                  <Text mt={2} fontSize="sm"><b>ID:</b> {currentPet.idMascota} | <b>Historial ID:</b> {historial?.idHistorial || 'N/A'}</Text>
                </VStack>
              </HStack>
            </Box>

            {/* --- SECCIÓN PRINCIPAL: TABS Y NOTAS --- */}
            
            {/* 2. TABS (Ocupa todo el ancho) */}
            <Box w="100%">
              <Tabs isFitted variant="enclosed-colored">
                <TabList>
                  <Tab _selected={{ color: 'white', bg: 'brand.800' }}><Icon as={FaNotesMedical} mr={2} /> Nuevo Diagnóstico</Tab>
                  <Tab _selected={{ color: 'white', bg: 'brand.800' }}><Icon as={FaSyringe} mr={2} /> Aplicar Vacuna</Tab>
                  <Tab>Historial Clínico ({diagnosticos.length})</Tab>
                  <Tab>Vacunas Aplicadas ({vacunas.length})</Tab>
                </TabList>
                
                <TabPanels>
                  {/* Pestaña: Nuevo Diagnóstico (CON SELECT DE ESTADO) */}
                  <TabPanel as="form" onSubmit={handleSubmitDiagnostico}>
                    <VStack spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>Diagnóstico *</FormLabel>
                        <Textarea name="diagnostico" value={diagForm.diagnostico} onChange={handleDiagFormChange} />
                      </FormControl>
                      
                      {/* --- 2. CAMPO MODIFICADO A SELECT --- */}
                      <FormControl>
                        <FormLabel>Estado de Salud</FormLabel>
                        <Select 
                          name="estadoSalud" 
                          value={diagForm.estadoSalud} 
                          onChange={handleDiagFormChange} 
                          placeholder="Seleccionar estado..."
                        >
                          {estadoSaludOptions.map(estado => (
                            <option key={estado} value={estado}>
                              {estado}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Tratamiento</FormLabel>
                        <Textarea name="tratamiento" value={diagForm.tratamiento} onChange={handleDiagFormChange} />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Observaciones (Internas)</FormLabel>
                        <Textarea name="observaciones" value={diagForm.observaciones} onChange={handleDiagFormChange} />
                      </FormControl>
                      
                      <Button type="submit" bg="brand.900" color="white" isLoading={isSubmitting} _hover={{ bg: 'brand.700' }}>Guardar Diagnóstico</Button>
                    </VStack>
                  </TabPanel>

                  {/* Pestaña: Aplicar Vacuna (color ajustado) */}
                  <TabPanel as="form" onSubmit={handleSubmitVacuna}>
                    <VStack spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>Vacuna del Catálogo *</FormLabel>
                        <Select name="idVacuna" value={vacForm.idVacuna} onChange={handleVacFormChange} placeholder="Seleccionar vacuna...">
                          {vacunaCatalog.map(v => (
                            <option key={v.idVacuna} value={v.idVacuna}>{v.nombre}</option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Observaciones</FormLabel>
                        <Textarea name="observaciones" value={vacForm.observaciones} onChange={handleVacFormChange} />
                      </FormControl>
                      <Button type="submit" bg="brand.700" color="white" isLoading={isSubmitting} _hover={{ bg: 'brand.900' }}>Aplicar Vacuna</Button>
                    </VStack>
                  </TabPanel>

                  {/* Pestaña: Historial Clínico (mostrar estado_salud) */}
                  <TabPanel>
                    {diagnosticos.length === 0 ? (
                      <Text>No hay diagnósticos previos.</Text>
                    ) : (
                      <Table size="sm">
                        <Thead>
                          <Tr><Th>Fecha</Th><Th>Diagnóstico</Th><Th>Estado Salud</Th></Tr>
                        </Thead>
                        <Tbody>
                          {diagnosticos.map(d => (
                            <Tr key={d.idDiagnostico}>
                              <Td>{formatFecha(d.fecha)}</Td>
                              <Td>{d.diagnostico}</Td>
                              <Td><Badge colorScheme={d.estadoSalud?.toLowerCase().includes('estable') ? 'green' : 'red'}>{d.estadoSalud || 'N/A'}</Badge></Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    )}
                  </TabPanel>
                  
                  {/* Pestaña: Vacunas Aplicadas */}
                  <TabPanel>
                    {vacunas.length === 0 ? (
                      <Text>No hay vacunas aplicadas.</Text>
                    ) : (
                      <Table size="sm">
                        <Thead>
                          <Tr><Th>Fecha</Th><Th>Vacuna</Th><Th>Observaciones</Th></Tr>
                        </Thead>
                        <Tbody>
                          {vacunas.map(v => (
                            <Tr key={v.idAplicacion}>
                              <Td>{v.fecha}</Td>
                              <Td>{v.vacuna.nombre}</Td>
                              <Td>{v.observaciones}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    )}
                  </TabPanel>
                  
                </TabPanels>
              </Tabs>
            </Box>
            
            {/* --- 3. BLOQUE DE NOTAS MOVIDO ABAJO --- */}
            <Box w="100%" bg="white" p={5} borderRadius="lg" shadow="md">
              <Heading size="sm" mb={4}>Notas Generales del Historial</Heading>
              <FormControl>
                <FormLabel fontSize="sm" color="gray.600">Comentarios importantes del historial (se guardan al presionar el botón):</FormLabel>
                <Textarea 
                  value={historialNotes} 
                  onChange={(e) => setHistorialNotes(e.target.value)} 
                  rows={8}
                  placeholder="Ej: Se leyó el historial, no presenta problemas crónicos, solo visitas por chequeo."
                />
                <Button 
                  mt={3}
                  size="sm"
                  bg="brand.800"
                  color="white"
                  onClick={handleSaveHistorialNotes}
                  isLoading={isSubmitting}
                  leftIcon={<Icon as={FaSave} />}
                  _hover={{ bg: 'brand.900' }}
                >
                  Guardar Notas
                </Button>
              </FormControl>
            </Box>
            
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default VeterinarioDashboardPage;